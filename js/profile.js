document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) {
        return
    }

    try {
        await Promise.all([
            loadUserInfo(),
            loadXPInfo(),
            loadStatistics()
        ])
    } catch (error) {
        console.error('Error loading profile data:', error);
        alert('An error occurred while loading your profile data. Please try again later.');
    }
})

async function loadUserInfo() {
    const container = document.getElementById('user-info-content')
    const auditContainer = document.getElementById('audit-info-content')
    try {
        const data = await getUserProfile()
        const user = data.user[0]

        if (!user) {
            container.textContent = 'User information not found.';
            auditContainer.textContent = 'User information not found.';
            return;
        }

        container.innerHTML = `
            <div>
                <p><strong>User ID:</strong> ${user.id}</p>
                <p><strong>Username:</strong> ${user.login}</p>
            </div>
        `;

        auditContainer.innerHTML = `
            <h2>${user.auditRatio.toFixed(1)}</h2>
        `;
    } catch (error) {
        console.error('Error loading user info:', error);
        container.textContent = 'Failed to load user information.';
        auditContainer.textContent = 'Failed to load user information.';
    }
}

async function loadXPInfo() {
    const container = document.getElementById('xp-info-content');

    try {
        const data = await getUserXP();
        const transactions = data.transaction

        if (!transactions || transactions.length === 0) {
            container.textContent = 'No XP information found.';
            return;
        }

        const totalXP = transactions.reduce((sum, trans) => sum + trans.amount, 0);

        const xpByPath = transactions.reduce((groups, trans) => {
            const path = trans.path.split('/');
            const lastElement = path[path.length - 1];
            if (!groups[lastElement]) {
                groups[lastElement] = 0;
            }
            groups[lastElement] += trans.amount;
            return groups;
        }, {});

        let html = `
        <div>
            <h3>Total XP: ${totalXP}</h3>
            <p>From ${transactions.length} transactions</p>

            <h4 style="margin-top: 15px;">Top Projects by XP:</h4>
            <ul>
            ${Object.entries(xpByPath).slice(0, 5).map(([ele, xp]) => `
            <li><strong>${ele}</strong>: ${xp} XP</li>
            `).join('')}
            </ul>
        </div>
        `
        // DEBUG:
        // console.log("transactions ->", transactions)
        // console.log("totalXP ->", totalXP)
        // console.log("xpByPath ->", xpByPath)

        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading XP info:', error);
        container.textContent = 'Failed to load XP information.';
    }
}

async function loadStatistics() {
    try {
        const xpData = await getXPOverTime();
        // DEBUG
        // console.log(xpData.transaction.reduce((acc,val) => acc += (Number(val.amount)),0))
        createXPProgressChart(xpData.transaction, 'xp-time-graph');

        const projectData = await getProjectResults();
        createProjectSuccessChart(projectData.progress, 'project-success-graph');
    } catch (error) {
        console.error('Error loading statistics:', error);

        const xpGraph = document.getElementById('xp-time-graph');
        if (xpGraph) {
            xpGraph.textContent = 'Failed to load XP statistics.';
        }

        const projectGraph = document.getElementById('project-success-graph');
        if (projectGraph) {
            projectGraph.textContent = 'Failed to load project statistics.';
        }
    }
}
