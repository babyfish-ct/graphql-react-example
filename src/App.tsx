import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks'
import { AppView } from './nav/AppView';

function App() {
    const client = new ApolloClient({
        uri: 'http://localhost:8080/graphql'
    });
    return (
        <ApolloProvider client={client}>
            <ApolloProvider client={client}>
                <AppView/>
            </ApolloProvider>
        </ApolloProvider>
    );
}

export default App;
