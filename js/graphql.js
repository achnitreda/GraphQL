const GRAPHQL_ENDPOINT = `https://${DOMAIN}/api/graphql-engine/v1/graphql`

async function executeQuery(query) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)

    if (!token) {
        throw new Error('Not authenticated');
    }

    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                query,
            })
        })

        if (!response.ok) {
            throw new Error('GraphQL request failed');
        }

        const data = await response.json()

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        return data.data
    } catch (error) {
        console.error('GraphQL query error:', error);
        throw error;
    }
}

async function getUserProfile() {
    const query = `
    {
    user {
        id
        login
        auditRatio
        }
    }
    `
    return executeQuery(query)
}

async function getUserXP() {
    const query = `
    {
    transaction(
        where : {
            type : {_eq : "xp"}
            path : {
                _niregex : "(piscine-js/|piscine-go)"
            }
        }
        order_by: {amount : desc}
    ) {
        id
        amount
        createdAt
        path
    }
    }
    `
    return executeQuery(query)
}

async function getProjectResults() {
    const query = `
    {
    progress(
        where: {
        grade : {_is_null:false}
            object: {
            type : {_eq : "project"}
        }
    }
    order_by : {createdAt : asc}
    ) {
        id
        grade
        createdAt
        object {
          name
        }
    }
    }
    `
    return executeQuery(query)
}

async function getXPOverTime() {
    const query = `
    {
      transaction
      (
        where : {
            type : {_eq : "xp"}
            path : {
                _niregex : "(piscine-js/|piscine-go)"
            }
        }
        order_by: {createdAt: asc}
      ) 
      {
        amount
        createdAt
      }
    }
    `;

    return executeQuery(query);
}