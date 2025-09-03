function calculateLoan() {
    let loanAmount = parseFloat(document.getElementById("loanAmount").value);
    let interestRate = parseFloat(document.getElementById("interestRate").value) / 100 / 12;
    let loanTerm = parseFloat(document.getElementById("loanTerm").value) * 12;

    if (isNaN(loanAmount) || isNaN(interestRate) || isNaN(loanTerm)) {
        document.getElementById("result").innerText = "⚠️ Please enter valid values!";
        return;
    }

    let monthlyPayment =
        (loanAmount * interestRate) /
        (1 - Math.pow(1 + interestRate, -loanTerm));

    if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
        monthlyPayment = 0;
    }

    document.getElementById("result").innerText =
        "Monthly Payment: ₹" + monthlyPayment.toFixed(2);
}

function resetForm() {
    document.getElementById("loanAmount").value = "";
    document.getElementById("interestRate").value = "";
    document.getElementById("loanTerm").value = "";
    document.getElementById("result").innerText = "Monthly Payment: ₹0.00";
}