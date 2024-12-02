function generateNewEmail() {
    fetch('generate_email.php', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        email = data.response;
        document.getElementById('email').value = email;
        document.cookie = "email=" + email + ";path=/;max-age=3600"; // 1 hour
        refreshInbox();
    });
}

function refreshInbox() {
    fetch('fetch_emails.php?email=' + encodeURIComponent(email))
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('inbox');
            tbody.innerHTML = '';
            if (data.response.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center p-4">No emails yet.</td></tr>';
            } else {
                data.response.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="px-4 py-2"><a href="view_message.php?uid=${item.uid}&email=${encodeURIComponent(email)}" class="text-blue-300 hover:text-blue-500">${item.subject}</a></td>
                        <td class="px-4 py-2">${item.from}</td>
                        <td class="px-4 py-2" data-date="${item.date}">${formatDate(item.date)}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        });
}

function deleteEmail() {
    fetch('delete_email.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status) {
            email = '';
            document.getElementById('email').value = 'No email as of the moment';
            document.getElementById('inbox').innerHTML = '';
            generateNewEmail();
        }
    });
}

function copyToClipboard() {
    navigator.clipboard.writeText(email);
}

function autoRefresh() {
    setInterval(() => {
        refreshInbox();
    }, 10000);
}

function checkEmail() {
    const inputEmail = document.getElementById('emailInput').value;
    const selectedDomain = document.getElementById('domainSelect').value;
    const fullEmail = inputEmail + '@' + selectedDomain;
    
    fetch('check_email.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'email=' + encodeURIComponent(fullEmail),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status) {
            email = fullEmail;
            document.getElementById('email').value = email;
            document.cookie = "email=" + email + ";path=/;max-age=3600"; // 1 hour
            refreshInbox();
        } else {
            alert(data.response);
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    return date.toLocaleString('en-US', options);
}
