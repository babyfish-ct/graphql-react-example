import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks'
import { AppView } from './nav/AppView';

function App() {
    const client = new ApolloClient({
        uri: 'http://192.168.2.151:8080/graphql'
    });
    return (
        <ApolloProvider client={client}>
            <AppView/>
        </ApolloProvider>
    );
}

export default App;
