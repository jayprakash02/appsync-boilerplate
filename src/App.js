import { graphql } from '@apollo/client/react/hoc';
import { gql, useMutation,  useSubscription } from '@apollo/client';
import { flowRight as compose } from 'lodash';
import React from 'react';

const getcontact = gql`
query MyQuery {
  listContactuses {
    items {
      id
      name
      email
    }
  }
}
`;
const createContact = gql`
mutation MyMutation2($name: String!, $email: String!) {
  createContactUs(input: {email: $email, name: $name, type: COMINGSOON}) {
    id
  }
}
`;

const oncreateContact = gql`
subscription MySubscription {
  onCreateContactUs {
    id
  }
}
`;

function App({ data: { listContactuses } }) {
  let input = { name: "", email: "" };
  const {data} = useSubscription(oncreateContact,{onData: ({client})=> {   client.refetchQueries({
    include: [getcontact],
  }); }})

  const [addContact, { loading, error }] = useMutation(createContact, {
    refetchQueries: [{
      query: getcontact
    }],
  });

  if (loading) return 'Submitting...';
  if (error) return `Submission error! ${error.message}`;


  if (listContactuses) {
    console.log(listContactuses)
    return (
      <div className="App">
        <header className="App-header">
          <form
            onSubmit={e => {
              e.preventDefault();
              addContact({ variables: { name: input.name.value, email: input.email.value } });
              input.name = input.email = '';
            }}
          >
            Name: <input
              ref={node => {
                input.name = node;
              }}
            />
            Email: <input
              ref={node => {
                input.email = node;
              }}
            />
            <button type="submit">Add Todo</button>
          </form>

          <p> Posts:
            {listContactuses.items.map((data, index) => (
              <React.Fragment key={data.id}><p>ID: {data.id}</p><p>name: {data.name}</p><p>email: {data.email}</p></React.Fragment>
            ))}
          </p>
        </header>
      </div>
    );
  }

}

export default compose(
  graphql(getcontact),
)(App);
