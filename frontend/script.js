const form = document.getElementById("discountForm");
const shareBtn = document.getElementById("shareBtn");
const messageBox = document.getElementById("messageBox");

const API_BASE_URL = "http://localhost:8081";

window.addEventListener("DOMContentLoaded", () => {
    const alreadySubmitted = localStorage.getItem("formSubmitted");

    if (alreadySubmitted === "true") {
        disableForm("This device has already submitted the form.");
    }
});

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const alreadySubmitted = localStorage.getItem("formSubmitted");
    if (alreadySubmitted === "true") {
        showMessage("This device has already submitted the form.", "error");
        disableForm("This device has already submitted the form.");
        return;
    }

    const data = {
        name: document.getElementById("name").value.trim(),
        className: document.getElementById("className").value.trim(),
        phoneNumber: document.getElementById("phoneNumber").value.trim(),
        purchaseStatus: document.getElementById("purchaseStatus").value
    };

    if (!data.name || !data.className || !data.phoneNumber || !data.purchaseStatus) {
        showMessage("Please fill all fields.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/forms/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Failed to submit form");
        }

        const result = await response.json();

        if (result.status === "ALREADY_SUBMITTED") {
            showMessage(result.message, "error");
            localStorage.setItem("formSubmitted", "true");
            disableForm(result.message);
            return;
        }

        localStorage.setItem("formSubmitted", "true");

        if (result.status === "PURCHASED") {
            window.location.href = `thank-you.html?message=${encodeURIComponent(result.message)}`;
        } else {
            window.location.href =
                `offer.html?discount=${result.discount}&couponCode=${encodeURIComponent(result.couponCode)}&message=${encodeURIComponent(result.message)}`;
        }
    } catch (error) {
        showMessage("Something went wrong. Please try again.", "error");
        console.error(error);
    }
});

shareBtn.addEventListener("click", async function () {
    const shareText = "I found this amazing offer. Fill the form and get your discount code now!";
    const shareUrl = window.location.href;
    const fullText = `${shareText} ${shareUrl}`;

    try {
        if (navigator.share) {
            await navigator.share({
                title: "Special Discount Offer",
                text: shareText,
                url: shareUrl
            });
            showMessage("Thanks for sharing!", "success");
        } else {
            await navigator.clipboard.writeText(fullText);
            showMessage("Share text copied! Paste and share it.", "success");
        }
    } catch (error) {
        showMessage("Share cancelled or failed.", "error");
    }
});

function disableForm(message) {
    document.getElementById("name").disabled = true;
    document.getElementById("className").disabled = true;
    document.getElementById("phoneNumber").disabled = true;
    document.getElementById("purchaseStatus").disabled = true;

    const submitBtn = document.querySelector(".primary-btn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "ALREADY SUBMITTED";
        submitBtn.style.opacity = "0.6";
        submitBtn.style.cursor = "not-allowed";
    }

    showMessage(message, "error");
}

function showMessage(message, type) {
    messageBox.style.display = "block";
    messageBox.textContent = message;
    messageBox.className = "message-box";

    if (type === "success") {
        messageBox.classList.add("message-success");
    } else {
        messageBox.classList.add("message-error");
    }
}