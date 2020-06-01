import React, { useState, useCallback, useMemo } from 'react';
import { AppView } from './nav/AppView';
import { BUSINESS_PREFIX } from './exception/APIErrorView'; 
import { GraphQLClient, ClientContext, Result, APIError, Headers } from 'graphql-hooks';
import { writeStorage, deleteFromStorage, useLocalStorage } from '@rehooks/local-storage';
import { LoginDialog } from './login/LoginDialog';

function App() {
    
    const [token] = useLocalStorage("token");
    const online = useMemo<boolean>(() => {
        return token !== undefined && token !== null && token !== "";
    }, [token]);
    const headers = useMemo<Headers>(() => {
        if (online) {
            return {
                Authorization: token
            } as Headers;
        }
        return {};
    }, [token, online]);

    const [loginDialog, setLoginDialog] = useState<boolean>(false);

    const handleUnauthorizedError = useCallback((error: APIError | undefined) => {
        if (error === undefined || error.graphQLErrors === undefined) {
            return;
        }
        const unauthorized =
            error
            .graphQLErrors
            .filter((graphQLError: any) => {
                const errorType = (graphQLError as any)["errorType"] as string | undefined;
                return errorType !== undefined && 
                    errorType.startsWith(BUSINESS_PREFIX) &&
                    errorType.substring(BUSINESS_PREFIX.length) === 'UNAUTHORIZED';
            })
            .length !== 0;
        if (unauthorized) {
            setLoginDialog(true);
        }
    }, []);

    const onLoginDialogClose = useCallback((token: string | undefined) => {
        if (token !== undefined) {
            writeStorage("token", token);
        }
        setLoginDialog(false);
    }, []);

    const onAuthorizationChanging = useCallback((online: boolean) => {
        if (online) {
            setLoginDialog(true);
        } else {
            deleteFromStorage("token");
        }
    }, []);

    const client = new GraphQLClient({
        url: 'http://localhost:8080/graphql',
        headers,
        onError: (obj: {result: Result}) => {
            handleUnauthorizedError(obj.result.error);
        }
    });
    return (
        <ClientContext.Provider value={client}>
            <AppView online={online} onAuthorizationChanging={onAuthorizationChanging}/>
            <LoginDialog 
            visible={loginDialog} 
            onClose={onLoginDialogClose}/>
        </ClientContext.Provider>
    );
}

export default App;
