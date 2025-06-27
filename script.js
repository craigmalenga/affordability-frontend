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

    // show the raw result
    const result = await response.json();
    document.getElementById("result").innerHTML =
      `<pre>${JSON.stringify(result, null, 2)}</pre>`;

    // 4) Immediately after processing, run the status‐update sequence:
    (async () => {
      const { leadId, autoDecision } = result;
      console.log("▶️ Running status updates for:", leadId, autoDecision);

      // decide pass vs fail
      const isPass = (autoDecision === "Affordability");
      const mainStatusText = isPass
        ? "Bank statements reviewed - submitted with claim"
        : "Source case closed";
      const linkedStatusText = isPass
        ? "Submit claim pending sign off"
        : "Closed - Non Viable DSAR";

      try {
        // update the main lead (group 61190)
        console.log("→ updating main:", mainStatusText);
        await updateStatusField(leadId, 61190, mainStatusText);

        // fetch its data1 for the linked lead ID
        const flgData = await fetchFLGData(leadId);
        const linkedLeadId = flgData.data1;
        console.log("→ got linkedLeadId:", linkedLeadId);
        if (!linkedLeadId) {
          console.warn("No linked Lead ID found in data1, skipping linked update.");
          return;
        }

        // update the linked lead (group 59549)
        console.log("→ updating linked:", linkedStatusText);
        await updateStatusField(linkedLeadId, 59549, linkedStatusText);

        console.log("✅ Both statuses updated successfully");
      } catch (err) {
        console.error("❌ Error during status updates:", err);
      }
    })();

    // final user alert
    alert("Confirmation – all information has been processed and status updates are in progress.");
  } catch (error) {
    console.error("Upload or processing failed:", error);
    alert("Error: " + (error.message || "Process failed"));
  }
}

document.getElementById("uploadBtn").addEventListener("click", uploadFiles);
