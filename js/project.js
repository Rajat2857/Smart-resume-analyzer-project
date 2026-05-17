// SECTIONS
const upload = document.getElementById("uploadSection");
const fileReady = document.getElementById("resultSection");
const loading = document.getElementById("loadingSection");
const finalResult = document.getElementById("finalResultSection");

// FILE INPUTS
const fileInput = document.getElementById("resumeFile");
const changeFileInput = document.getElementById("changeFileInput");

// BUTTONS
const analyzeBtn = document.getElementById("analyzeBtnSecond");
const clearBtn = document.getElementById("clearBtn");
const goBackBtn = document.getElementById("goBackBtn");

// DISPLAY
const fileNameText = document.getElementById("fileName");
const resultFileName = document.getElementById("resultFileName");

let selectedFileName = "";
let extractedResumeText = "";
let latestATSResult = null;





async function extractPDFText(file) {
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = async function () {
      const typedArray = new Uint8Array(this.result);

      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map(item => item.str)
          .join(" ");

        fullText += pageText + " ";
      }

      resolve(fullText.toLowerCase());
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}





function calculateATS(text) {
  text = text.toLowerCase();

  let score = 0;
  let suggestions = [];
  let strengths = [];

  let skillScore = 0;
  let experienceScore = 0;
  let projectScore = 0;
  let certScore = 0;

  // DOMAIN SKILLS //
  const skillDomains = {
    tech: [
      "html", "css", "javascript", "python", "flask",
      "react", "node", "sql", "api", "java", "c",
      "c++", "kotlin", "xml", "mysql", "git",
      "github", "matlab", "selenium", "junit",
      "mockito", "django", "mongodb", "express"
    ],
    mechanical: [
      "autocad", "solidworks", "catia", "cnc",
      "ansys", "fusion 360", "matlab", "creo",
      "machine design", "thermodynamics"
    ],
    civil: [
      "staad", "autocad", "surveying", "revit",
      "construction", "estimation", "soil testing",
      "structural design", "quantity surveying"
    ],
    marketing: [
      "seo", "google ads", "analytics", "excel",
      "management", "branding", "content marketing",
      "social media", "market research"
    ],
    finance: [
      "tally", "excel", "taxation", "accounting",
      "financial analysis", "gst", "auditing",
      "bookkeeping", "budgeting"
    ]
  };

  // DETECT DOMAIN //
  let bestMatchDomain = null;
  let maxMatches = 0;

  for (const domain in skillDomains) {
    const matches = skillDomains[domain].filter(skill =>
      text.includes(skill)
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatchDomain = domain;
    }
  }

  // SKILLS SCORE //
  if (bestMatchDomain) {
    const detectedSkills = skillDomains[bestMatchDomain];

    const matchedSkills = detectedSkills.filter(skill =>
      text.includes(skill)
    );

    const matchedCount = Math.min(matchedSkills.length, 6);

    skillScore = (matchedCount / 6) * 30;
    score += skillScore;

    if (matchedCount >= 4) {
      strengths.push("Strong domain-relevant skills match");
    } else {
      suggestions.push(`Add more ${bestMatchDomain} skills`);
    }
  } else {
    suggestions.push("Add more domain-relevant skills");
  }

  // EDUCATION //
  const educationKeywords = [
    "education", "btech", "b.e", "bca", "mca",
    "mba", "degree", "university", "college"
  ];

  if (educationKeywords.some(word => text.includes(word))) {
    score += 15;
    strengths.push("Education section detected");
  } else {
    suggestions.push("Add education details");
  }

  // EXPERIENCE //
  const yearMatch = text.match(/(\d+)\+?\s*(years|year)/);
  const monthMatch = text.match(/(\d+)\+?\s*(months|month)/);

  if (yearMatch) {
    const years = parseInt(yearMatch[1]);

    if (years >= 5) experienceScore = 15;
    else if (years >= 3) experienceScore = 12;
    else if (years >= 2) experienceScore = 10;
    else if (years >= 1) experienceScore = 8;
  } else if (monthMatch) {
    const months = parseInt(monthMatch[1]);

    if (months >= 12) experienceScore = 8;
    else if (months >= 6) experienceScore = 6;
    else if (months >= 3) experienceScore = 4;
    else experienceScore = 2;
  } else if (
    text.includes("internship") ||
    text.includes("experience")
  ) {
    experienceScore = 6;
  } else {
    suggestions.push("Add work experience clearly");
  }

  score += experienceScore;

  if (experienceScore >= 8) {
    strengths.push("Good practical experience relevance");
  }

  //  PROJECTS //
  const projectCount =
    (text.match(/project/g) || []).length +
    (text.match(/•/g) || []).length +
    (text.match(/-/g) || []).length;

  if (projectCount > 0) {
    projectScore = Math.min(projectCount * 3, 15);
    score += projectScore;
    strengths.push("Excellent project section coverage");
  } else {
    suggestions.push("Add project section");
  }

  // CERTIFICATIONS //
  const certCount =
    (text.match(/certificate/g) || []).length +
    (text.match(/certifications/g) || []).length +
    (text.match(/certified/g) || []).length +
    (text.match(/certification/g) || []).length;

  certScore = Math.min(certCount * 5, 10);
  score += certScore;

  if (certCount === 0) {
    suggestions.push("Add certifications");
  }

  // CONTACT //
  if (text.includes("@")) {
    score += 3;
  } else {
    suggestions.push("Add email address");
  }

  const digits = (text.match(/\d/g) || []).length;

  if (digits >= 10) {
    score += 2;
  } else {
    suggestions.push("Add phone number");
  }

  // OVERALL STRENGTH //
  if (score >= 75) {
    strengths.push("Overall ATS-friendly resume structure");
  }

  return {
    score: Math.round(score),
    suggestions,
    strengths,
    domain: bestMatchDomain,
    breakdown: {
      skills: Math.round(skillScore),
      experience: Math.round(experienceScore),
      projects: Math.round(projectScore),
      certifications: Math.round(certScore)
    }
  };
}





function saveToHistory(fileName, score) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) return;

  const historyKey = "history_" + currentUser.email;

  let history = JSON.parse(localStorage.getItem(historyKey)) || [];

  history.unshift({
    file_name: fileName,
    score: score,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  });

  localStorage.setItem(historyKey, JSON.stringify(history));
}





fileInput.addEventListener("change", async function () {

  if (this.files.length > 0) {
    const file = this.files[0];

    selectedFileName = file.name;
    extractedResumeText = await extractPDFText(file);

    upload.style.display = "none";
    fileReady.style.display = "flex";

    resultFileName.textContent = selectedFileName;
  }

});





/* ================= CHANGE FILE ================= */

changeFileInput.addEventListener("change", async function () {

  if (this.files.length > 0) {
    const file = this.files[0];

    selectedFileName = file.name;
    extractedResumeText = await extractPDFText(file);

    resultFileName.textContent = selectedFileName;
  }

});




/* CLEAR */

clearBtn.addEventListener("click", function () {


  fileReady.style.display = "none";
  upload.style.display = "block";

});




/* ANALYZE */

analyzeBtn.addEventListener("click", function () {

  if (!extractedResumeText) {
    alert("Please upload resume first");
    return;
  }

  latestATSResult = calculateATS(extractedResumeText);

  fileReady.style.display = "none";
  loading.style.display = "block";

  setTimeout(() => {

    loading.style.display = "none";
    finalResult.style.display = "block";

    document.getElementById("score").textContent =
      latestATSResult.score + "%";

    const skillsPercent = Math.round(
      (latestATSResult.breakdown.skills / 30) * 100
    );

    const experiencePercent = Math.round(
      (latestATSResult.breakdown.experience / 15) * 100
    );

    const projectsPercent = Math.round(
      (latestATSResult.breakdown.projects / 15) * 100
    );

    // progress bars fill
    document.getElementById("skillsProgress").style.width =
      skillsPercent + "%";

    document.getElementById("experienceProgress").style.width =
      experiencePercent + "%";

    document.getElementById("projectsProgress").style.width =
      projectsPercent + "%";

    // percentage text
    document.getElementById("skillsPercent").textContent =
      skillsPercent + "%";

    document.getElementById("experiencePercent").textContent =
      experiencePercent + "%";

    document.getElementById("projectsPercent").textContent =
      projectsPercent + "%";


    saveToHistory(selectedFileName, latestATSResult.score);  

    document.getElementById("suggestions").innerHTML =
      latestATSResult.suggestions.map(item => `<li>${item}</li>`).join("");

    document.getElementById("strengthsList").innerHTML =
      latestATSResult.strengths.map(item => `<li>${item}</li>`).join("");


        // DOMAIN //
    document.getElementById("domainName").textContent =
      latestATSResult.domain ? latestATSResult.domain.toUpperCase() : "GENERAL";

    // LEVEL //
    let level = "";

    if(latestATSResult.score >= 80){
      level = "Strong 💪";
    }else if(latestATSResult.score >= 60){
      level = "Intermediate ⚡";
    }else{
      level = "Needs Improvement 📉";
    }

    document.getElementById("resumeLevel").textContent = level;

    // SUMMARY //
    let summary = "";

    if(latestATSResult.score >= 80){
      summary = "Excellent resume with strong ATS compatibility and well-balanced sections.";
    }else if(latestATSResult.score >= 60){
      summary = "Good resume but needs improvements in some sections to increase ATS score.";
    }else{
      summary = "Your resume needs significant improvements to pass ATS systems effectively.";
    }

    document.getElementById("summaryText").textContent = summary;

  }, 2000);

});




/* BACK TO START */

goBackBtn.addEventListener("click", function () {


  finalResult.style.display = "none";
  upload.style.display = "block";

});





/* Download Buttton */

const downloadBtn = document.getElementById("downloadBtn");

if (downloadBtn) {
  downloadBtn.addEventListener("click", function () {

    if (!latestATSResult) {
      alert("Please analyze resume first");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;

    //  HEADER //
    doc.setFontSize(20);
    doc.text("Resume ATS Report", 20, y);

    y += 15;

    doc.setFontSize(12);
    doc.text("File Name: " + selectedFileName, 20, y);
    y += 10;

    doc.text("ATS Score: " + latestATSResult.score + "%", 20, y);
    y += 10;

    doc.text("Generated: " + new Date().toLocaleString(), 20, y);
    y += 15;

    // DOMAIN 
    const domain = latestATSResult.domain
      ? latestATSResult.domain.toUpperCase()
      : "GENERAL";

    doc.text("Domain: " + domain, 20, y);
    y += 10;

    // LEVEL 
    let level = "";
    if (latestATSResult.score >= 80) level = "Strong";
    else if (latestATSResult.score >= 60) level = "Intermediate";
    else level = "Needs Improvement";

    doc.text("Resume Level: " + level, 20, y);
    y += 15;

    // SUMMARY 
    let summary = "";
    if (latestATSResult.score >= 80) {
      summary = "Excellent resume with strong ATS compatibility.";
    } else if (latestATSResult.score >= 60) {
      summary = "Good resume but needs improvements.";
    } else { 
      summary = "Resume needs significant improvements.";
    }

    doc.setFontSize(14);
    doc.text("Summary:", 20, y);

    y += 10;
    doc.setFontSize(11);
    doc.text(summary, 20, y, { maxWidth: 170 });

    y += 15;

    // STRENGTHS //
    doc.setFontSize(14);
    doc.text("Top Strengths:", 20, y);

    y += 10;
    doc.setFontSize(11);

    latestATSResult.strengths.forEach((item) => {
      doc.text("- " + item, 20, y, { maxWidth: 170 });
      y += 8;
    });

    y += 10;

    // IMPROVEMENTS 
    doc.setFontSize(14);
    doc.text("Main Improvements:", 20, y);

    y += 10;
    doc.setFontSize(11);

    latestATSResult.suggestions.forEach((item) => {
      doc.text("- " + item, 20, y, { maxWidth: 170 });
      y += 8;
    });

    // SAVE
    const cleanFileName = selectedFileName.replace(".pdf", "");
    doc.save(cleanFileName + "_ATS_Report.pdf");
  });
}


