import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks'
import { AppView } from './nav/AppView';

function App() {
    const client = createApolloClient();
    return (
        <ApolloProvider client={client}>
            <AppView/>
        </ApolloProvider>
    );
}

function createApolloClient(): ApolloClient<any> {
    let client = new ApolloClient({
        uri: 'http://localhost:8080/graphql'
    });
    client.defaultOptions = {
        query: {
            fetchPolicy: "network-only"
        }  
    };
    return client;
}

export default App;
