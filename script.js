/* ==========================================================
   AdmitPro - College Admission Portal
   =================================================*/

// ---------- Constants ----------
const COURSES = [
    "B.Tech Computer Science",
    "B.Tech Electronics & Communication",
    "B.Tech Mechanical Engineering",
    "B.Tech Civil Engineering",
    "MBA (Business Administration)",
    "B.Sc Computer Science"
];

const STATUS_FLOW = ["Submitted", "Under Review", "Shortlisted", "Merit List", "Admitted"];

const REQUIRED_DOCS = [
    "Passport Size Photo", "Signature", "10th Marksheet",
    "12th Marksheet", "Transfer Certificate", "Identity Proof"
];

// ---------- Data (arrays / objects) ----------
let users = [];         // login accounts
let students = [];      // registered students
let applications = [];  // applications
let documents = [];     //uploaded document records -  (names only)
let meritList = [];     //generated merit list entries
let comments = [];      //reviewer comments
let currentUser = null;
let selectedAppId = null;
let currentStep = 1;

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);

function today() {
    return new Date().toISOString().split("T")[0];
}

function nextId(list) {
    return list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;
}

// Prevent HTML injection when printing user text into the page
function esc(text) {
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
}

function badge(status) {
    const cls = status.toLowerCase().replace(/\s+/g, "-");
    return `<span class="badge ${cls}">${esc(status)}</span>`;
}

function totalScore(app) {
    // 60% academic + 40% entrance
    return Math.round((app.academic_score * 0.6 + app.entrance_score * 0.4) * 100) / 100;
}

function getStudent(id) {
    return students.find((s) => s.id === id);
}

function studentName(id) {
    const s = getStudent(id);
    return s ? s.name : "Unknown";
}

let toastTimer;
function toast(message) {
    const t = $("toast");
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

// ---------- Storage ----------
function saveData() {
    localStorage.setItem("admitpro", JSON.stringify({ users, students, applications, documents, meritList, comments }));
}

function loadData() {
    const raw = localStorage.getItem("admitpro");
    if (raw) {
        try {
            const d = JSON.parse(raw);
            users = d.users || [];
            students = d.students || [];
            applications = d.applications || [];
            documents = d.documents || [];
            meritList = d.meritList || [];
            comments = d.comments || [];
            return;
        } catch (e) {
            console.warn("Saved data was unreadable, loading sample data.");
        }
    }
    loadSampleData();
    saveData();
}

function loadSampleData() {
    users = [{ id: 1, name: "Admin", email: "admin@admitpro.com", password: "admin123" }];

    students = [
        { id: 1, name: "John Smith", email: "john@email.com", phone: "+91 9876543210", dob: "2000-05-15", gender: "Male", address: "123 Main St, Mumbai", pct10: 90, pct12: 92, application_date: "2026-06-01" },
        { id: 2, name: "Sarah Johnson", email: "sarah@email.com", phone: "+91 9876543211", dob: "2001-08-20", gender: "Female", address: "456 Park Ave, Delhi", pct10: 88, pct12: 85, application_date: "2026-06-05" },
        { id: 3, name: "Arjun Kumar", email: "arjun@email.com", phone: "+91 9876543212", dob: "2002-01-11", gender: "Male", address: "78 Anna Nagar, Chennai", pct10: 95, pct12: 94, application_date: "2026-06-07" },
        { id: 4, name: "Priya Nair", email: "priya@email.com", phone: "+91 9876543213", dob: "2001-11-02", gender: "Female", address: "22 MG Road, Kochi", pct10: 82, pct12: 86, application_date: "2026-06-09" },
        { id: 5, name: "Rahul Verma", email: "rahul@email.com", phone: "+91 9876543214", dob: "2001-03-27", gender: "Male", address: "9 Civil Lines, Lucknow", pct10: 76, pct12: 80, application_date: "2026-06-10" },
        { id: 6, name: "Ananya Rao", email: "ananya@email.com", phone: "+91 9876543215", dob: "2002-07-19", gender: "Female", address: "5 Indiranagar, Bengaluru", pct10: 91, pct12: 89, application_date: "2026-06-12" },
        { id: 7, name: "Mohammed Ali", email: "ali@email.com", phone: "+91 9876543216", dob: "2000-12-05", gender: "Male", address: "14 Banjara Hills, Hyderabad", pct10: 70, pct12: 72, application_date: "2026-06-14" },
        { id: 8, name: "Divya Menon", email: "divya@email.com", phone: "+91 9876543217", dob: "2001-09-30", gender: "Female", address: "31 Race Course, Coimbatore", pct10: 93, pct12: 96, application_date: "2026-06-15" }
    ];

    applications = [
        { id: 1, student_id: 1, course: "B.Tech Computer Science", academic_score: 92, entrance_score: 85, status: "Submitted", submitted_date: "2026-06-01" },
        { id: 2, student_id: 2, course: "MBA (Business Administration)", academic_score: 85, entrance_score: 80, status: "Under Review", submitted_date: "2026-06-05" },
        { id: 3, student_id: 3, course: "B.Tech Computer Science", academic_score: 94, entrance_score: 91, status: "Shortlisted", submitted_date: "2026-06-07" },
        { id: 4, student_id: 4, course: "B.Tech Computer Science", academic_score: 86, entrance_score: 78, status: "Shortlisted", submitted_date: "2026-06-09" },
        { id: 5, student_id: 5, course: "B.Tech Mechanical Engineering", academic_score: 80, entrance_score: 70, status: "Rejected", submitted_date: "2026-06-10" },
        { id: 6, student_id: 6, course: "B.Sc Computer Science", academic_score: 89, entrance_score: 84, status: "Shortlisted", submitted_date: "2026-06-12" },
        { id: 7, student_id: 7, course: "B.Tech Civil Engineering", academic_score: 72, entrance_score: 65, status: "Submitted", submitted_date: "2026-06-14" },
        { id: 8, student_id: 8, course: "B.Tech Computer Science", academic_score: 96, entrance_score: 93, status: "Admitted", submitted_date: "2026-06-15" }
    ];

    documents = [
        { id: 1, student_id: 1, document_name: "Passport Size Photo", file_name: "john_photo.jpg", upload_date: "2026-06-01", status: "Verified" },
        { id: 2, student_id: 1, document_name: "12th Marksheet", file_name: "john_12th.pdf", upload_date: "2026-06-01", status: "Verified" },
        { id: 3, student_id: 3, document_name: "Identity Proof", file_name: "arjun_aadhaar.pdf", upload_date: "2026-06-07", status: "Pending" }
    ];

    meritList = [
        { id: 1, student_id: 8, app_id: 8, rank: 1, total_score: 94.8, course: "B.Tech Computer Science", status: "Admitted" }
    ];

    comments = [
        { id: 1, app_id: 5, text: "Entrance score below the course cut-off.", by: "Admin", date: "2026-06-11" }
    ];
}

// AUTHENTICATION

function showApp() {
    $("auth-screen").classList.add("hidden");
    $("app").classList.remove("hidden");
    $("user-name").textContent = currentUser.name;
    renderAll();
    goToPage(location.hash.replace("#", "") || "dashboard");
}

function showLogin() {
    $("app").classList.add("hidden");
    $("auth-screen").classList.remove("hidden");
}

$("tab-login").addEventListener("click", () => {
    $("login-form").classList.remove("hidden");
    $("signup-form").classList.add("hidden");
    $("tab-login").classList.add("active");
    $("tab-signup").classList.remove("active");
});

$("tab-signup").addEventListener("click", () => {
    $("signup-form").classList.remove("hidden");
    $("login-form").classList.add("hidden");
    $("tab-signup").classList.add("active");
    $("tab-login").classList.remove("active");
});

$("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("login-email").value.trim().toLowerCase();
    const password = $("login-password").value;
    const user = users.find((u) => u.email.toLowerCase() === email && u.password === password);
    if (!user) {
        toast("Invalid email or password.");
        return;
    }
    currentUser = user;
    sessionStorage.setItem("admitpro-user", user.id);
    $("login-form").reset();
    showApp();
});

$("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("signup-email").value.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) {
        toast("An account with this email already exists.");
        return;
    }
    const user = {
        id: nextId(users),
        name: $("signup-name").value.trim(),
        email,
        password: $("signup-password").value
    };
    users.push(user);
    saveData();
    currentUser = user;
    sessionStorage.setItem("admitpro-user", user.id);
    $("signup-form").reset();
    toast("Account created. Welcome, " + user.name + "!");
    showApp();
});

$("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("admitpro-user");
    currentUser = null;
    showLogin();
});

// NAVIGATION (one page visible at a time)

const PAGE_TITLES = {
    "dashboard": "Dashboard",
    "register": "Student Registration",
    "apply": "Application Form",
    "applications": "Applications",
    "application-detail": "Application Detail",
    "documents": "Document Upload",
    "review": "Application Review",
    "merit-list": "Merit List",
    "admission": "Admission Confirmation",
    "reports": "Reports"
};

function goToPage(page) {
    if (!PAGE_TITLES[page]) page = "dashboard";

    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active-page"));
    $(page).classList.add("active-page");

    document.querySelectorAll(".nav-links a").forEach((a) => {
        a.classList.toggle("active", a.dataset.page === page);
    });

    $("page-title").textContent = PAGE_TITLES[page];
    $("sidebar").classList.remove("open");
    window.scrollTo(0, 0);
    if (location.hash !== "#" + page) history.replaceState(null, "", "#" + page);
}

document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        goToPage(link.dataset.page);
    });
});

$("menu-btn").addEventListener("click", () => $("sidebar").classList.toggle("open"));

// ---------- Dark mode ----------
function setDark(on) {
    document.body.classList.toggle("dark", on);
    $("dark-toggle").innerHTML = on ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem("admitpro-dark", on ? "1" : "0");
}

$("dark-toggle").addEventListener("click", () => setDark(!document.body.classList.contains("dark")));

// ---------- Global search (jumps to Applications) ----------
$("global-search").addEventListener("input", (e) => {
    $("app-search").value = e.target.value;
    if (e.target.value.trim()) goToPage("applications");
    renderApplications();
});

// DASHBOARD

function renderDashboard() {
    $("stat-total").textContent = applications.length;
    $("stat-review").textContent = applications.filter((a) => a.status === "Under Review").length;
    $("stat-admitted").textContent = applications.filter((a) => a.status === "Admitted").length;
    $("stat-rejected").textContent = applications.filter((a) => a.status === "Rejected").length;

    const recent = [...applications]
        .sort((a, b) => b.submitted_date.localeCompare(a.submitted_date) || b.id - a.id)
        .slice(0, 5);

    $("recent-applications").innerHTML = recent.length
        ? recent.map((a) => `
            <tr>
                <td>#${a.id}</td>
                <td>${esc(studentName(a.student_id))}</td>
                <td>${esc(a.course)}</td>
                <td>${esc(a.submitted_date)}</td>
                <td>${badge(a.status)}</td>
            </tr>`).join("")
        : `<tr><td colspan="5" class="empty-row">No applications yet.</td></tr>`;
}

// STUDENT REGISTRATION

$("register-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const email = $("reg-email").value.trim().toLowerCase();
    if (students.some((s) => s.email.toLowerCase() === email)) {
        toast("A student with this email is already registered.");
        return;
    }

    const student = {
        id: nextId(students),
        name: $("reg-name").value.trim(),
        email,
        phone: $("reg-phone").value.trim(),
        dob: $("reg-dob").value,
        gender: $("reg-gender").value,
        address: $("reg-address").value.trim(),
        pct10: Number($("reg-10th").value),
        pct12: Number($("reg-12th").value),
        application_date: today()
    };

    students.push(student);
    saveData();
    $("register-form").reset();
    renderAll();
    toast("Student registered: " + student.name);
});

function fillStudentDropdowns() {
    const options = students.map((s) => `<option value="${s.id}">${esc(s.name)} (${esc(s.email)})</option>`).join("");
    ["apply-student", "doc-student"].forEach((id) => {
        const select = $(id);
        const keep = select.value;
        select.innerHTML = `<option value="">Select student</option>` + options;
        select.value = keep;
    });
}

// MULTI-STEP APPLICATION FORM

function showStep(n) {
    currentStep = n;
    for (let i = 1; i <= 3; i++) {
        $("step-" + i).classList.toggle("active", i === n);
        $("dot-" + i).classList.toggle("active", i <= n);
    }
    $("prev-btn").classList.toggle("hidden", n === 1);
    $("next-btn").classList.toggle("hidden", n === 3);
    $("submit-btn").classList.toggle("hidden", n !== 3);
}

function validateStep(n) {
    if (n === 1 && !$("apply-student").value) {
        toast("Please select a student.");
        return false;
    }
    if (n === 2) {
        const course = $("apply-course").value;
        const acad = $("apply-academic").value;
        const ent = $("apply-entrance").value;
        if (!course || acad === "" || ent === "") {
            toast("Please fill the course and both scores.");
            return false;
        }
        if (acad < 0 || acad > 100 || ent < 0 || ent > 100) {
            toast("Scores must be between 0 and 100.");
            return false;
        }
        const studentId = Number($("apply-student").value);
        if (applications.some((a) => a.student_id === studentId && a.course === course)) {
            toast("This student has already applied for this course.");
            return false;
        }
    }
    return true;
}

function buildReviewSummary() {
    const s = getStudent(Number($("apply-student").value));
    const acad = Number($("apply-academic").value);
    const ent = Number($("apply-entrance").value);
    const total = Math.round((acad * 0.6 + ent * 0.4) * 100) / 100;
    $("review-summary").innerHTML = `
        <b>Student:</b> ${esc(s.name)}<br>
        <b>Email:</b> ${esc(s.email)}<br>
        <b>Course:</b> ${esc($("apply-course").value)}<br>
        <b>Academic Score:</b> ${acad}%<br>
        <b>Entrance Score:</b> ${ent}%<br>
        <b>Total Score:</b> ${total}`;
}

$("next-btn").addEventListener("click", () => {
    if (!validateStep(currentStep)) return;
    if (currentStep === 2) buildReviewSummary();
    showStep(currentStep + 1);
});

$("prev-btn").addEventListener("click", () => showStep(currentStep - 1));

$("apply-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    const app = {
        id: nextId(applications),
        student_id: Number($("apply-student").value),
        course: $("apply-course").value,
        academic_score: Number($("apply-academic").value),
        entrance_score: Number($("apply-entrance").value),
        status: "Submitted",
        submitted_date: today()
    };

    applications.push(app);
    saveData();
    $("apply-form").reset();
    showStep(1);
    renderAll();
    toast("Application #" + app.id + " submitted. Confirmation email sent (simulated).");
    goToPage("applications");
});

// APPLICATION LISTING (search + filters)

function renderApplications() {
    const q = $("app-search").value.trim().toLowerCase();
    const status = $("filter-status").value;
    const course = $("filter-course").value;
    const date = $("filter-date").value;

    const rows = applications.filter((a) => {
        const nameMatch = studentName(a.student_id).toLowerCase().includes(q);
        return nameMatch
            && (!status || a.status === status)
            && (!course || a.course === course)
            && (!date || a.submitted_date === date);
    });

    $("applications-body").innerHTML = rows.length
        ? rows.map((a) => `
            <tr>
                <td>#${a.id}</td>
                <td>${esc(studentName(a.student_id))}</td>
                <td>${esc(a.course)}</td>
                <td>${totalScore(a)}</td>
                <td>${esc(a.submitted_date)}</td>
                <td>${badge(a.status)}</td>
                <td>
                    <button class="btn-small" data-view="${a.id}">View</button>
                    <button class="btn-small btn-grey" data-review="${a.id}">Review</button>
                </td>
            </tr>`).join("")
        : `<tr><td colspan="7" class="empty-row">No applications match your search.</td></tr>`;
}

["app-search", "filter-status", "filter-course", "filter-date"].forEach((id) => {
    $(id).addEventListener("input", renderApplications);
});

$("clear-filters").addEventListener("click", () => {
    ["app-search", "filter-status", "filter-course", "filter-date", "global-search"].forEach((id) => ($(id).value = ""));
    renderApplications();
});

// Buttons inside the table (event delegation)
$("applications-body").addEventListener("click", (e) => {
    const view = e.target.closest("[data-view]");
    const review = e.target.closest("[data-review]");
    if (view) openDetail(Number(view.dataset.view));
    if (review) {
        $("review-app").value = review.dataset.review;
        renderReviewInfo();
        goToPage("review");
    }
});

// APPLICATION DETAIL

function openDetail(appId) {
    selectedAppId = appId;
    renderDetail();
    goToPage("application-detail");
}

function renderDetail() {
    const app = applications.find((a) => a.id === selectedAppId);
    if (!app) return;
    const s = getStudent(app.student_id) || {};

    const item = (label, value) => `<div class="detail-item"><span>${label}</span><strong>${esc(value)}</strong></div>`;

    $("detail-content").innerHTML =
        item("Application ID", "#" + app.id) +
        item("Status", app.status) +
        item("Student", s.name) +
        item("Email", s.email) +
        item("Phone", s.phone) +
        item("Date of Birth", s.dob) +
        item("Gender", s.gender) +
        item("Address", s.address) +
        item("Course", app.course) +
        item("Submitted On", app.submitted_date) +
        item("10th / 12th %", `${s.pct10} / ${s.pct12}`) +
        item("Academic / Entrance", `${app.academic_score} / ${app.entrance_score}`) +
        item("Total Score", totalScore(app));

    // Status tracking
    let html = "";
    if (app.status === "Rejected") {
        html = `<div class="tl-step done">Submitted</div><div class="tl-step rejected">Rejected</div>`;
    } else {
        const idx = STATUS_FLOW.indexOf(app.status);
        html = STATUS_FLOW.map((st, i) => `<div class="tl-step ${i <= idx ? "done" : ""}">${st}</div>`).join("");
    }
    $("detail-timeline").innerHTML = html;

    // Documents
    const docs = documents.filter((d) => d.student_id === app.student_id);
    const missing = REQUIRED_DOCS.filter((name) => !docs.some((d) => d.document_name === name));
    $("detail-documents").innerHTML =
        (docs.length
            ? docs.map((d) => `<li><i class="fa-solid fa-file"></i> ${esc(d.document_name)} - ${esc(d.file_name)} ${badge(d.status)}</li>`).join("")
            : `<li>No documents uploaded yet.</li>`)
        + (missing.length ? `<li style="color:var(--danger)">Missing: ${esc(missing.join(", "))}</li>` : "");

    // Comments
    const notes = comments.filter((c) => c.app_id === app.id);
    $("detail-comments").innerHTML = notes.length
        ? notes.map((c) => `<li>${esc(c.text)} <small style="color:var(--text-gray)">- ${esc(c.by)}, ${esc(c.date)}</small></li>`).join("")
        : `<li>No comments yet.</li>`;
}

// DOCUMENT UPLOAD (simulated - only file names are stored)

$("upload-btn").addEventListener("click", () => {
    const studentId = Number($("doc-student").value);
    if (!studentId) {
        toast("Please select a student first.");
        return;
    }

    let count = 0;
    document.querySelectorAll("#documents input[type=file]").forEach((input) => {
        if (!input.files.length) return;
        const name = input.dataset.doc;
        const record = {
            student_id: studentId,
            document_name: name,
            file_name: input.files[0].name,
            upload_date: today(),
            status: "Pending"
        };
        const existing = documents.find((d) => d.student_id === studentId && d.document_name === name);
        if (existing) Object.assign(existing, record);
        else documents.push({ id: nextId(documents), ...record });
        input.value = "";
        count++;
    });

    if (!count) {
        toast("Choose at least one file to upload.");
        return;
    }
    saveData();
    renderDocuments();
    toast(count + " document(s) uploaded (simulated).");
});

function renderDocuments() {
    $("documents-body").innerHTML = documents.length
        ? documents.map((d) => `
            <tr>
                <td>${esc(studentName(d.student_id))}</td>
                <td>${esc(d.document_name)}</td>
                <td>${esc(d.file_name)}</td>
                <td>${esc(d.upload_date)}</td>
                <td>${badge(d.status)}</td>
            </tr>`).join("")
        : `<tr><td colspan="5" class="empty-row">No documents uploaded.</td></tr>`;
}

// APPLICATION REVIEW (approve / reject with comments)

function fillReviewDropdown() {
    const keep = $("review-app").value;
    const reviewable = applications.filter((a) => ["Submitted", "Under Review", "Shortlisted"].includes(a.status));
    $("review-app").innerHTML = `<option value="">Select application</option>` + reviewable
        .map((a) => `<option value="${a.id}">#${a.id} - ${esc(studentName(a.student_id))} (${esc(a.course)}) - ${a.status}</option>`)
        .join("");
    $("review-app").value = keep;
}

function renderReviewInfo() {
    const box = $("review-info");
    const app = applications.find((a) => a.id === Number($("review-app").value));
    if (!app) {
        box.classList.add("hidden");
        return;
    }
    box.classList.remove("hidden");
    box.innerHTML = `
        <b>${esc(studentName(app.student_id))}</b> - ${esc(app.course)}<br>
        Academic: ${app.academic_score}% | Entrance: ${app.entrance_score}% | Total: ${totalScore(app)}<br>
        Current status: ${badge(app.status)}`;
}

$("review-app").addEventListener("change", renderReviewInfo);

function reviewAction(newStatus, requireComment) {
    const app = applications.find((a) => a.id === Number($("review-app").value));
    if (!app) {
        toast("Please select an application.");
        return;
    }
    const text = $("review-comment").value.trim();
    if (requireComment && !text) {
        toast("Please write a comment for the rejection.");
        return;
    }

    app.status = newStatus;
    if (text) {
        comments.push({ id: nextId(comments), app_id: app.id, text, by: currentUser.name, date: today() });
    }
    saveData();

    const student = getStudent(app.student_id);
    $("review-comment").value = "";
    $("review-app").value = "";
    renderAll();
    toast(`Application #${app.id} marked "${newStatus}". Email sent to ${student ? student.email : "student"} (simulated).`);
}

$("btn-under-review").addEventListener("click", () => reviewAction("Under Review", false));
$("btn-approve").addEventListener("click", () => reviewAction("Shortlisted", false));
$("btn-reject").addEventListener("click", () => reviewAction("Rejected", true));

// MERIT LIST GENERATION

$("generate-merit").addEventListener("click", () => {
    const course = $("merit-course").value;
    const seats = Number($("merit-seats").value);
    const cutoff = Number($("merit-cutoff").value);

    if (!course) {
        toast("Please select a course.");
        return;
    }
    if (!seats || seats < 1) {
        toast("Enter a valid number of seats.");
        return;
    }

    // Candidates for this course: Shortlisted (and already on list / admitted)
    const candidates = applications
        .filter((a) => a.course === course && ["Shortlisted", "Merit List", "Admitted"].includes(a.status))
        .map((a) => ({ app: a, total: totalScore(a) }))
        .filter((c) => c.total >= cutoff)
        .sort((x, y) => y.total - x.total)
        .slice(0, seats);

    if (!candidates.length) {
        toast("No shortlisted applicants meet the criteria for this course.");
        return;
    }

    // Replace the old list for this course
    meritList = meritList.filter((m) => m.course !== course);
    candidates.forEach((c, i) => {
        if (c.app.status === "Shortlisted") c.app.status = "Merit List";
        meritList.push({
            id: nextId(meritList),
            student_id: c.app.student_id,
            app_id: c.app.id,
            rank: i + 1,
            total_score: c.total,
            course,
            status: c.app.status
        });
    });

    saveData();
    renderAll();
    toast(`Merit list generated for ${course} (${candidates.length} students).`);
});

function renderMerit() {
    const list = [...meritList].sort((a, b) => a.course.localeCompare(b.course) || a.rank - b.rank);
    $("merit-body").innerHTML = list.length
        ? list.map((m) => {
            const app = applications.find((a) => a.id === m.app_id);
            return `
            <tr>
                <td><b>${m.rank}</b></td>
                <td>${esc(studentName(m.student_id))}</td>
                <td>${esc(m.course)}</td>
                <td>${m.total_score}</td>
                <td>${badge(app ? app.status : m.status)}</td>
            </tr>`;
        }).join("")
        : `<tr><td colspan="5" class="empty-row">No merit list generated yet.</td></tr>`;
}


// ADMISSION CONFIRMATION & LETTER
function renderAdmission() {
    const list = [...meritList].sort((a, b) => a.course.localeCompare(b.course) || a.rank - b.rank);
    $("admission-body").innerHTML = list.length
        ? list.map((m) => {
            const app = applications.find((a) => a.id === m.app_id);
            const admitted = app && app.status === "Admitted";
            return `
            <tr>
                <td>${m.rank}</td>
                <td>${esc(studentName(m.student_id))}</td>
                <td>${esc(m.course)}</td>
                <td>${m.total_score}</td>
                <td>${badge(app ? app.status : m.status)}</td>
                <td>
                    ${admitted
                        ? `<button class="btn-small" data-letter="${m.app_id}">Admission Letter</button>`
                        : `<button class="btn-small btn-green" data-confirm="${m.app_id}">Confirm Admission</button>`}
                </td>
            </tr>`;
        }).join("")
        : `<tr><td colspan="6" class="empty-row">Generate a merit list first.</td></tr>`;
}

$("admission-body").addEventListener("click", (e) => {
    const confirmBtn = e.target.closest("[data-confirm]");
    const letterBtn = e.target.closest("[data-letter]");

    if (confirmBtn) {
        const app = applications.find((a) => a.id === Number(confirmBtn.dataset.confirm));
        app.status = "Admitted";
        const entry = meritList.find((m) => m.app_id === app.id);
        if (entry) entry.status = "Admitted";
        saveData();
        renderAll();
        const s = getStudent(app.student_id);
        toast(`Admission confirmed for ${s.name}. Email sent to ${s.email} (simulated).`);
        showLetter(app.id);
    }
    if (letterBtn) showLetter(Number(letterBtn.dataset.letter));
});

function showLetter(appId) {
    const app = applications.find((a) => a.id === appId);
    const s = getStudent(app.student_id);
    const entry = meritList.find((m) => m.app_id === appId);

    $("letter").innerHTML = `
        <h2>AdmitPro College</h2>
        <p class="center">Office of Admissions</p>
        <p><b>Date:</b> ${today()}<br><b>Reference:</b> ADM-${new Date().getFullYear()}-${String(app.id).padStart(4, "0")}</p>
        <p style="margin-top:16px;">Dear <b>${esc(s.name)}</b>,</p>
        <p>Congratulations! We are pleased to inform you that you have been <b>offered admission</b>
        to the <b>${esc(app.course)}</b> programme${entry ? ` with Merit Rank <b>${entry.rank}</b> (Score ${entry.total_score})` : ""}.</p>
        <p>Please report to the admissions office with your original documents to complete the enrolment formalities.</p>
        <p class="sign">Sincerely,<br><b>Admissions Committee</b><br>AdmitPro College</p>`;

    $("letter-card").classList.remove("hidden");
    $("letter-card").scrollIntoView({ behavior: "smooth" });
}

$("print-letter").addEventListener("click", () => {
    document.body.classList.add("printing-letter");
    window.print();
    document.body.classList.remove("printing-letter");
});

// REPORTS + ANALYTICS + EXPORT

function courseStats() {
    return COURSES.map((course) => {
        const apps = applications.filter((a) => a.course === course);
        const avg = apps.length ? apps.reduce((sum, a) => sum + totalScore(a), 0) / apps.length : 0;
        return {
            course,
            total: apps.length,
            shortlisted: apps.filter((a) => ["Shortlisted", "Merit List", "Admitted"].includes(a.status)).length,
            admitted: apps.filter((a) => a.status === "Admitted").length,
            rejected: apps.filter((a) => a.status === "Rejected").length,
            avg: Math.round(avg * 100) / 100
        };
    });
}

function barChart(containerId, data) {
    const max = Math.max(1, ...data.map((d) => d.value));
    $(containerId).innerHTML = data.map((d) => `
        <div class="bar-row">
            <span>${esc(d.label)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${(d.value / max) * 100}%"></div></div>
            <b>${d.value}</b>
        </div>`).join("");
}

function renderReports() {
    const stats = courseStats();

    $("report-course").innerHTML = stats.map((c) => `
        <tr>
            <td>${esc(c.course)}</td>
            <td>${c.total}</td>
            <td>${c.shortlisted}</td>
            <td>${c.admitted}</td>
            <td>${c.rejected}</td>
            <td>${c.avg}</td>
        </tr>`).join("");

    barChart("course-chart", stats.map((c) => ({ label: c.course, value: c.total })));

    // Gender demographics (based on applicants)
    const genders = ["Male", "Female", "Other"].map((g) => ({
        label: g,
        value: applications.filter((a) => (getStudent(a.student_id) || {}).gender === g).length
    }));
    barChart("gender-chart", genders);

    // Status summary
    const statuses = [...STATUS_FLOW, "Rejected"].map((st) => ({
        label: st,
        value: applications.filter((a) => a.status === st).length
    }));
    barChart("status-chart", statuses);
}

$("export-csv").addEventListener("click", () => {
    const header = ["Application ID", "Student", "Email", "Gender", "Course", "Academic", "Entrance", "Total", "Status", "Date"];
    const rows = applications.map((a) => {
        const s = getStudent(a.student_id) || {};
        return [a.id, s.name, s.email, s.gender, a.course, a.academic_score, a.entrance_score, totalScore(a), a.status, a.submitted_date];
    });

    const csv = [header, ...rows]
        .map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "admitpro-applications.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    toast("CSV exported.");
});

$("export-pdf").addEventListener("click", () => window.print());

// RENDER EVERYTHING
function renderAll() {
    fillStudentDropdowns();
    fillReviewDropdown();
    renderDashboard();
    renderApplications();
    renderDocuments();
    renderReviewInfo();
    renderMerit();
    renderAdmission();
    renderReports();
    if (selectedAppId) renderDetail();
}

// START

loadData();
showStep(1);
setDark(localStorage.getItem("admitpro-dark") === "1");

// Keep the user logged in during the same browser session
const savedUserId = sessionStorage.getItem("admitpro-user");
const savedUser = users.find((u) => u.id === Number(savedUserId));
if (savedUser) {
    currentUser = savedUser;
    showApp();
}