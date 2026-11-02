 // BUILDCIRCLE APPLICATION

const SUPABASE_URL = "https://kckmmjnbxjblfhyddtny.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NOIDmemVZAx6oeFUS2cQSA_q7kgkTrP";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// HTML ELEMENTS

const loginView = document.getElementById("loginView");
const signupView = document.getElementById("signupView");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

const dashboardView = document.getElementById("dashboardView");
const pageContainer = document.querySelector(".page-container");
const homePage = document.getElementById("homePage");
const otherPage = document.getElementById("otherPage");

const pageTitle = document.getElementById("otherPageTitle");
const pageDescription = document.getElementById("otherPageDescription");

// MESSAGE FUNCTIONS

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

function clearMessage() {
    message.textContent = "";
    message.className = "message";
}
const pageInfo = {
    home: ["Dashboard", "Your personal BuildCircle workspace."],
    discover: ["Discover", "Explore students, skills and ideas."],
    join: ["Join a Team", "Find projects and request to join teams."],
    create: ["Create a Team", "Start a project and invite teammates."],
    build: ["Build Together", "Collaborate with your project team."],
    profile: ["My Profile", "Showcase your skills and projects."],
    saved: ["Saved Projects", "Find your bookmarked projects."]
};

function navigateTo(page) {
    if (!pageInfo[page]) return;

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    if (page === "home") {
        homePage.classList.remove("hidden");
        otherPage.classList.add("hidden");
    } else {
        homePage.classList.add("hidden");
        otherPage.classList.remove("hidden");
        pageTitle.textContent = pageInfo[page][0];
        pageDescription.textContent = pageInfo[page][1];
    }

    window.scrollTo(0, 0);
}

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", function(event) {
        event.preventDefault();
        navigateTo(this.dataset.page);
    });
});
function updateUserProfile(user) {
    if (!user) return;

    const fullName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Student";

    const firstName = fullName.split(" ")[0];

    const userName = document.getElementById("userName");
    const sidebarName = document.getElementById("sidebarUserName");

    if (userName) userName.textContent = firstName;
    if (sidebarName) sidebarName.textContent = fullName;

    const initials = fullName.split(" ")
        .map(word => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const avatar = document.querySelector(".sidebar-avatar");
    if (avatar) avatar.textContent = initials;

    const profileButton = document.getElementById("profileShortcut");
    if (profileButton) profileButton.textContent = initials;
}

// SHOW DASHBOARD — FIXED

function showDashboard(user) {
    pageContainer.classList.add("hidden");

    loginView.classList.add("hidden");
    signupView.classList.add("hidden");

    dashboardView.classList.remove("hidden");

    updateUserProfile(user);
    navigateTo("home");

    window.scrollTo(0, 0);
}
// LOGIN

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    clearMessage();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        showMessage(error.message, "error");
        return;
    }

    showDashboard(data.user);
});

// SIGNUP

signupForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    clearMessage();

    const fullName = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName }
        }
    });

    if (error) {
        showMessage(error.message, "error");
    } else {
        showMessage(
            "Account created! Check your email to verify it.",
            "success"
        );
    }
});
// SWITCH TO SIGNUP

document.getElementById("showSignup").addEventListener("click", () => {
    loginView.classList.add("hidden");
    signupView.classList.remove("hidden");
    clearMessage();
});

// SWITCH TO LOGIN

document.getElementById("showLogin").addEventListener("click", () => {
    signupView.classList.add("hidden");
    loginView.classList.remove("hidden");
    clearMessage();
});

// FORGOT PASSWORD

document.getElementById("forgotBtn").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;

    if (!email) {
        showMessage("Enter your email address first.", "error");
        return;
    }

    const { error } =
        await supabaseClient.auth.resetPasswordForEmail(email);

    if (error) {
        showMessage(error.message, "error");
    } else {
        showMessage("Password reset link sent to your email.", "success");
    }
});
// LOGOUT — FIXED

document.getElementById("logoutBtn").addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert(error.message);
        return;
    }

    dashboardView.classList.add("hidden");
    pageContainer.classList.remove("hidden");

    loginView.classList.remove("hidden");
    signupView.classList.add("hidden");

    clearMessage();
    window.scrollTo(0, 0);
});

// NOTIFICATIONS

document.getElementById("notificationBtn").addEventListener("click", () => {
    alert("Notifications will be available in a future update.");
});

// PROJECT SEARCH

const searchInput = document.getElementById("dashboardSearch");

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();

        document.querySelectorAll(".featured-card").forEach(card => {
            card.style.display = card.textContent.toLowerCase()
                .includes(query) ? "" : "none";
        });
    });
}
// TERMS AND PRIVACY

document.getElementById("termsLink").addEventListener("click", event => {
    event.preventDefault();
    alert("Terms and Conditions will be available soon.");
});

document.getElementById("privacyLink").addEventListener("click", event => {
    event.preventDefault();
    alert("Privacy Policy will be available soon.");
});

// RESTORE EXISTING LOGIN SESSION

async function restoreSession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session error:", error.message);
        return;
    }

    if (data.session) {
        showDashboard(data.session.user);
    } else {
        dashboardView.classList.add("hidden");
        pageContainer.classList.remove("hidden");
        loginView.classList.remove("hidden");
    }
}

restoreSession();