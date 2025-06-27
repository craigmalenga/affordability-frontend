// 1) Helper to update a single field for any lead/group
function updateStatusField(leadId, leadgroup, statusValue) {
  return fetch("https://web-production-15e92-up.railway.app/api/flg_update", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leadId: leadId,
      leadgroup: leadgroup,
      field: "Status",
      value: statusValue
    })
  })
  .then(res => res.json())
  .then(respData => {
    if (respData.error) {
      console.error(`Error updating status for ${leadId} (group ${leadgroup}):`, respData.error);
      throw new Error(respData.error);
    }
    return respData;
  });
}

// 2) Helper to fetch FLG data (to read data1)
function fetchFLGData(leadId) {
  return fetch(`https://web-production-15e92-up.railway.app/api/flg_data/${leadId}`, {
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) throw new Error(data.error);
    return data;
  });
}

async function selectFolder() {
  try {
    const handle = await window.showDirectoryPicker(); // Opens folder picker
    document.getElementById("folderPath").value = handle.name; // Only stores folder name
  } catch (err) {
    console.error("Folder selection cancelled or failed:", err);
  }
}

document.getElementById("loginBtn").addEventListener("click", () => {
  // Replace with your backend login URL
  window.location.href = "https://web-production-15e92-up.railway.app/login";
});

document.getElementById("listFilesBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("https://web-production-15e92-up.railway.app/list-files");
    if (!response.ok) {
      const err = await response.json();
      throw new Error(JSON.stringify(err));
    }
    const data = await response.json();
    renderFileList(data.value);
  } catch (error) {
    console.error("Error listing files:", error);
    alert("Failed to list files. Check console.");
  }
});

function renderFileList(files) {
  const container = document.getElementById("filesContainer");
  container.innerHTML = "";
  files.forEach(file => {
    const div = document.createElement("div");
    div.textContent = file.name;
    container.appendChild(div);
  });
}

async function uploadFiles() {
  const folderName = document.getElementById("folderPath").value;

  if (!folderName) {
    alert("Please select a folder.");
    return;
  }

  try {
    // 3) Send the selected folder path to your backend for processing
    const response = await fetch("https://web-production-15e92-up.railway.app/process-files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder_path: folderName })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(JSON.stringify(err));
    }

    const result = await response.json();
    document.getElementById("result").innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;

    // 4) After processing, chain the FLG status updates
    const { leadId, autoDecision } = result;  // assuming your backend returns these
    const primaryDecision = autoDecision === "Affordability";
    const statusMain = primaryDecision
      ? "Bank statements reviewed - submitted with claim"
      : "Source case closed";

    // Update status on the main lead (leadgroup 61190)
    await updateStatusField(leadId, 61190, statusMain);

    // Fetch to get linked Lead ID from data1
    const data = await fetchFLGData(leadId);
    const linkedLeadId = data.data1;
    if (!linkedLeadId) throw new Error("No linked Lead ID found in data1");

    // Determine linked-status text and update it (leadgroup 59549)
    const statusLinked = primaryDecision
      ? "Submit claim pending sign off"
      : "Closed - Non Viable DSAR";
    await updateStatusField(linkedLeadId, 59549, statusLinked);

    // Final confirmation
    alert("Confirmation – all information and statuses have been updated successfully");
  } catch (error) {
    console.error("Upload or status update failed:", error);
    alert("Error: " + (error.message || "Process failed"));
  }
}

document.getElementById("uploadBtn").addEventListener("click", uploadFiles);
