document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
        return;
    }
});

// Function to render user input for XSS demo
function renderUserInput() {
    const userInput = document.getElementById('xss-input').value;
    
    // Vulnerable way (directly inserting HTML)
    const vulnerableOutput = document.getElementById('xss-vulnerable-output');
    vulnerableOutput.innerHTML = userInput;
    
    // Safe way (using textContent)
    const safeOutput = document.getElementById('xss-safe-output');
    safeOutput.textContent = userInput;
}

// Function to simulate SQL injection
function simulateSqlInjection() {
    const sqlInput = document.getElementById('sql-input').value;
    
    // Vulnerable way (directly using user input in SQL)
    const vulnerableOutput = document.getElementById('sql-vulnerable-output');
    
    // Simulate SQL injection vulnerability
    if (sqlInput.toLowerCase().includes("or 1=1") || 
        sqlInput.toLowerCase().includes("--") || 
        sqlInput.toLowerCase().includes("union select")) {
        vulnerableOutput.innerHTML = `
            <div class="sql-result">
                <p>Query executed: ${sqlInput}</p>
                <p class="text-danger">Potential SQL injection detected!</p>
                <p>Results: All user records returned (10 records)</p>
                <ul>
                    <li>admin (Administrator)</li>
                    <li>user1 (Regular User)</li>
                    <li>user2 (Regular User)</li>
                    <li>...</li>
                </ul>
            </div>
        `;
    } else {
        vulnerableOutput.innerHTML = `
            <div class="sql-result">
                <p>Query executed: ${sqlInput}</p>
                <p>Results: Query executed successfully</p>
                <p>No records found or specific records returned based on query</p>
            </div>
        `;
    }
    
    // Safe way (using parameterized queries)
    const safeOutput = document.getElementById('sql-safe-output');
    safeOutput.innerHTML = `
        <div class="sql-result">
            <p>Using parameterized query with user input as parameter</p>
            <p>Results: Only authorized data returned</p>
            <p>SQL injection prevented</p>
        </div>
    `;
}