document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
    const resultDiv = document.getElementById("result");

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name1 = signupForm.name1.value;
        const name2 = signupForm.name2.value;
        const email = signupForm.email.value;
        const password = signupForm.password.value;
        const confirmpassword = signupForm.confirmpassword.value;

        // client-side validation
        if (!name1 || !name2 || !email || !password || !confirmpassword) {
            resultDiv.textContent = "Please fill in all fields.";
            return;
        }

        // Sending user data to the server for processing
        fetch("/index", {
            method: "POST",
            body: JSON.stringify({ name1, name2, email, password, confirmpassword }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.text())
        .then(data => {
            resultDiv.textContent = data;
        });
    });
});
