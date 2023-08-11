var editRowId = null; // Keeps track of the row being edited

// Load stored data on page load
document.addEventListener("DOMContentLoaded", function() {
    loadStoredData();
});

function submitForm() {
    var name = document.getElementById("name").value;
    var place = document.getElementById("place").value;
    var money = parseFloat(document.getElementById("money").value);

    var currentDate = new Date();
    var date = currentDate.toLocaleDateString();
    var time = currentDate.toLocaleTimeString();

    var now = new Date();
    var formattedDate = now.toLocaleDateString();
    var formattedTime = now.toLocaleTimeString();

    var data = {
        id: Date.now(),
        name: name,
        place: place,
        money: money,
        date: formattedDate,
        time: formattedTime
    };

    // Store the data in local storage
    var storedData = localStorage.getItem("storedData");
    var parsedData = storedData ? JSON.parse(storedData) : [];
    parsedData.push(data);
    localStorage.setItem("storedData", JSON.stringify(parsedData));

    var tableBody = document.getElementById("tableBody");

    if (editRowId !== null) {
        // Update existing row
        var row = tableBody.querySelector(`tr[data-row-id="${editRowId}"]`);
        var cells = row.getElementsByTagName("td");
        cells[0].textContent = name;
        cells[1].textContent = place;
        cells[2].textContent = money.toFixed(2);
        cells[3].textContent = date;
        cells[4].textContent = time;
        editRowId = null;
    } else {
        // Add new row
        var newRow = document.createElement("tr");
        newRow.setAttribute("data-row-id", Date.now()); // Use timestamp as row ID
        newRow.innerHTML = `
            <td>${name}</td>
            <td>${place}</td>
            <td>${money.toFixed(2)}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td><button onclick="editRowConfirmation(this)">Edit</button></td>
            <td><button onclick="deleteRowConfirmation(this)">Delete</button></td>
        `;
        tableBody.appendChild(newRow);
    }

    updateSummaryTable();
    saveDataToLocalStorage();

    // Clear input fields
    document.getElementById("name").value = "";
    document.getElementById("place").value = "";
    document.getElementById("money").value = "";

    return false; // Prevent form submission to a server
}

data.forEach(function(item) {
    var truncatedPlace = item.place.length > 10 ? item.place.substring(0, 10) + '...' : item.place;
    content.push([
        item.name,
        { text: truncatedPlace, colSpan: 2 }, // Use colSpan to merge columns
        item.money.toFixed(2),
        item.date,
        item.time
    ]);
});



function editRowConfirmation(button) {
    if (confirm("Are you sure you want to edit this row?")) {
        editRow(button);
    }
}

function editRow(button) {
    var row = button.parentNode.parentNode;
    var cells = row.getElementsByTagName("td");
    var name = cells[0].textContent;
    var place = cells[1].textContent;
    var money = parseFloat(cells[2].textContent);
    var date = cells[3].textContent;
    var time = cells[4].textContent;

    document.getElementById("name").value = name;
    document.getElementById("place").value = place;
    document.getElementById("money").value = money;

    editRowId = row.getAttribute("data-row-id");

    // Create a new edited row
    var newRow = document.createElement("tr");
    newRow.setAttribute("data-row-id", editRowId);
    newRow.innerHTML = `
        <td>${name}</td>
        <td>${place}</td>
        <td>${money.toFixed(2)}</td>
        <td>${date}</td>
        <td>${time}</td>
        <td><button onclick="editRowConfirmation(this)">Edit</button></td>
        <td><button onclick="deleteRowConfirmation(this)">Delete</button></td>
    `;

    var tableBody = document.getElementById("tableBody");
    var rows = tableBody.getElementsByTagName("tr");
    
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].getAttribute("data-row-id") === editRowId) {
            tableBody.replaceChild(newRow, rows[i]);
            break;
        }
    }

    updateSummaryTable();
}





function deleteRowConfirmation(button) {
    if (confirm("Are you sure you want to delete this row?")) {
        deleteRow(button);
    }
}

function deleteRow(button) {
    var row = button.parentNode.parentNode;
    row.remove();

    updateSummaryTable();
    saveDataToLocalStorage();
}

function updateSummaryTable() {
    var summaryTableBody = document.getElementById("summaryTableBody");
    var summary = {};

    var rows = document.querySelectorAll("#tableBody tr");
    rows.forEach(function(row) {
        var name = row.cells[0].textContent;
        var money = parseFloat(row.cells[2].textContent);
        if (!summary[name]) {
            summary[name] = 0;
        }
        summary[name] += money;
    });

    summaryTableBody.innerHTML = "";
    for (var name in summary) {
        var newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${name}</td>
            <td>${summary[name].toFixed(2)}</td>
        `;
        summaryTableBody.appendChild(newRow);
    }
}


function downloadLocalStoragePDF() {
    var storedData = localStorage.getItem("storedData");
    if (storedData) {
        var data = JSON.parse(storedData);
        
        var content = [];
        content.push([{ text: "Name", bold: true }, { text: "Place", bold: true }, { text: "Money", bold: true },
        { text: "Date", bold: true },
        { text: "Time", bold: true }]);
        
        data.forEach(function(item) {
            content.push([item.name, item.place, item.money.toFixed(2),
                item.date,
                item.time]);
        });
        
        var summaryContent = [];
        summaryContent.push([{ text: "Name", bold: true }, { text: "Total Money", bold: true }]);
        
        var summaryRows = document.querySelectorAll("#summaryTableBody tr");
        summaryRows.forEach(function(row) {
            var cells = row.getElementsByTagName("td");
            var name = cells[0].textContent;
            var totalMoney = cells[1].textContent;
            summaryContent.push([name, totalMoney]);
        });
        
        var docDefinition = {
            content: [
                { text: "Expenditure Data", style: "header", alignment: "center", marginTop: 20},
                { text: "\n" },
                { text: "Data", style: "header",},
                { table: { body: content }, layout: "lightHorizontalLines" },
                { text: "\n\n\n" },
                { text: "Summary by name", style: "header" },
                { table: { body: summaryContent }, layout: "lightHorizontalLines" },
                { text: "Text Hi on Whats'app +91 9030852509 For more related Web applications", alignment: "center", marginTop: 20 }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
            }
        };
        
        pdfMake.createPdf(docDefinition).download("expenditure_data.pdf");
    }
}







function loadStoredData() {
    var storedData = localStorage.getItem("storedData");
    if (storedData) {
        var parsedData = JSON.parse(storedData);
        var tableBody = document.getElementById("tableBody");

        parsedData.forEach(function (item) {
            var newRow = document.createElement("tr");
            newRow.setAttribute("data-row-id", item.id);
            newRow.innerHTML = `
                <td>${item.name}</td>
                <td>${item.place}</td>
                <td>${item.money.toFixed(2)}</td>
                <td>${item.date}</td>
                <td>${item.time}</td>
                <td><button onclick="editRowConfirmation(this)">Edit</button></td>
                <td><button onclick="deleteRowConfirmation(this)">Delete</button></td>
            `;
            tableBody.appendChild(newRow);
        });

        updateSummaryTable();
    }
}





function saveDataToLocalStorage() {
    var rows = document.querySelectorAll("#tableBody tr");
    var data = [];

    rows.forEach(function(row) {
        var cells = row.getElementsByTagName("td");
        var id = row.getAttribute("data-row-id");
        var name = cells[0].textContent;
        var place = cells[1].textContent;
        var money = parseFloat(cells[2].textContent);
        var date = cells[3].textContent;
        var time = cells[4].textContent;
        
        data.push({
            id: id,
            name: name,
            place: place,
            money: money,
            date: date,
            time: time
        });
    });

    localStorage.setItem("storedData", JSON.stringify(data));
}

