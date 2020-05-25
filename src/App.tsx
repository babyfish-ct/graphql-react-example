import React from 'react';
import { AppView } from './nav/AppView';
import { GraphQLClient, ClientContext } from 'graphql-hooks';

function App() {
    const client = new GraphQLClient({
        url: 'http://localhost:8080/graphql'
    });
    return (
        <ClientContext.Provider value={client}>
            <AppView/>
        </ClientContext.Provider>
    );
}

export default App;
