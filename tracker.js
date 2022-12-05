window.addEventListener("DOMContentLoaded", (event) => {
  let allBillsArray = [];
  let showThisMany = 5;
  const addThisMany = 1;

  const start = () => {
    getSheetData({
      sheetName: "bills",
      query: "SELECT * WHERE E > date '2020-07-9' ORDER BY E DESC",
      callback: getBillsResponse,
    });
  };

  const getBillsResponse = (bills) => {
    //bill is array of objects
    allBillsArray = bills;
    displayBills(allBillsArray);
    console.log("dolla dolla bills: ", bills);
    // loadContainerQueryPolyfill();
  };

  const loadContainerQueryPolyfill = () => {
    if (!("container" in document.documentElement.style)) {
      console.log("loading polyfill!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      import("https://cdn.skypack.dev/container-query-polyfill");
    }
  };

  const stringToList = (str) => {
    if (str.trim() === "") return "";
    return (
      "<ul>" +
      str
        .split("\n\n")
        .map((item) => `<li>${item}</li>`)
        .join("") +
      "</ul>"
    );
  };

  const stringToHTML = (str) => {
    let paragraphs = str
      .split("\n\n")
      .map((item) => {
        return item.trim().length === 0 ? "" : `<p>${item}</p>`;
      })
      .join("");
    const regex = /[\r\n]/g;
    // console.log(p.replace(regex, 'ferret'));
    return paragraphs.replace(regex, "<br />");
    // return paragraphs;
  };

  const billTemplate = (bill) => {
    const quantity = bill["Cosponsor Quantity"];
    const introduced = bill["Introduced"];
    const lastAction = bill["Last Action"];
    const link = bill["Link"];
    const name = bill["Name"];
    const number = bill["Number"];
    const sponsor = bill["Sponsor"];
    const summary = stringToHTML(bill["Summary"]);
    const support = bill["Support"];
    const analysis = stringToList(bill["Analysis"]);
    const notes = bill["Notes"];
    const democrat = bill["Democrat"];
    const republican = bill["Republican"];
    const independent = bill["Independent"];
    const bipartisan = bill["Bipartisan"];
    const boldChanges = bill["Bold Changes"];
    const practical = bill["Practical Infrastructure"];
    const omnibus = bill["Omnibus Bill"];
    const newIncentive = bill["New Incentive"];
    const progress1 = bill["Approved By Committee"];
    const progress2 = bill["Passed House"];
    const progress3 = bill["Passed Senate"];
    const progress4 = bill["To President"];
    const progress5 = bill["Passed"];
    const cosponsorsD = bill["Cosponsors (D)"].trim();
    const cosponsorsR = bill["Cosponsors (R)"].trim();
    const cosponsorsI = bill["Cosponsors (I)"].trim();

    return `<div class="bill">
        <div class="bill-main">
          <div class="bill-header">
            <a href="${link}" target="_blank" class="bill-number">${number}</a>
            <div class="title">${name}</div>

            <div class="bill-label">Lead Sponsor</div>
            <div class="sponsor">${sponsor}</div>
            <div class="cosponsor-quantity">/ ${quantity} Cosponsors</div>
            <div class="bill-progress-wrap">
              <div class="bill-progress">
                <ul>
                  <li class="active">Introduced</li>
                  <li ${
                    progress1 ? 'class="active"' : ""
                  }>Approved By Committee</li>
                  <li ${progress2 ? 'class="active"' : ""}>Passed House</li>
                  <li ${progress3 ? 'class="active"' : ""}>Passed Senate</li>
                  <li ${progress4 ? 'class="active"' : ""}>To President</li>
                  <li ${progress5 ? 'class="active"' : ""}>Became Law</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="bill-mobile-sidebar">
            ${aboveTheFoldFiltersTemplate(bill)}
            ${listFilters(bill)}
          </div>
          <div class="bill-summary">
            <div class="bill-label">Summary</div>
            <p>
            ${linksToHTML(summary)}
            </p>
            ${supportIfExists(support)}
            <div class="bill-section-spacer"></div>
            <div class="bill-label">Analysis</div>
            <p>
            ${analysis}
            </p>
            ${notesIfExists(notes)}
            ${cosponsorsTemplate(cosponsorsD, cosponsorsR, cosponsorsI)}

          </div>
        </div>
        <div class="bill-sidebar">
            ${aboveTheFoldFiltersTemplate(bill)}
            ${listFilters(bill)}
        </div>
        <button type="button" class="bill-showhide">
          <span class="showhide-text">SHOW MORE</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="10.958" height="6.893" viewBox="0 0 10.958 6.893">
            <path id="Path_29" data-name="Path 29" d="M321.357,2054.082l4.772,4.772,4.772-4.772"
              transform="translate(-320.65 -2053.375)" fill="none" stroke-width="2"></path>
          </svg>
        </button>
    </div>`;
  };

  const cosponsorsTemplate = (cosponsorsD, cosponsorsR, cosponsorsI) => {
    const parties = [];
    if (cosponsorsD) {
      parties.push(`
        <div class="cosponsors-democrat">
          <span class="cosponsors-d-title">Democratic Cosponsors:</span>
          ${cosponsorsD}
        </div>
      `);
    }
    if (cosponsorsR) {
      parties.push(`
        <div class="cosponsors-republican">
          <span class="cosponsors-r-title">Republican Cosponsors:</span>
          ${cosponsorsR}
        </div>
      `);
    }
    if (cosponsorsI) {
      parties.push(`
        <div class="cosponsors-independent">
          <span class="cosponsors-i-title">Independent Cosponsors:</span>
          ${cosponsorsI}
        </div>
      `);
    }
    if (parties.length > 0) {
      return `
        <div class="cosponsors">
          ${parties.join("")}
        </div>
      `;
    }
    return "";

    // <div class="cosponsors">
    //           <div class="cosponsors-democrat">
    //             <span class="cosponsors-d-title">Democratic Cosponsors:</span>
    //             ${cosponsorsD}
    //           </div>
    //           <div class="cosponsors-republican">
    //             <span class="cosponsors-r-title">Republican Cosponsors:</span>
    //             ${cosponsorsR}
    //           </div>
    //           <div class="cosponsors-independent">
    //             <span class="cosponsors-i-title">Independent Cosponsors:</span>
    //             ${cosponsorsI}
    //           </div>
    //         </div>
  };

  const listFilters = (bill) => {
    const belowTheFoldTags = [
      "Soil Health",
      "Livestock/Grazing",
      "Local/Regional Food Systems",
      "Ag Infrastructure",
      "Forestry",
      "Wildfire",
      "Row Crops",
      "Finance",
      "Taxes",
      "Incentives",
      "Regional Infrastructure",
      "Research",
      "Crop Insurance",
      "Marker Bill",
      "Regulation",
      "Removing Barriers",
      "Omnibus Package",
      "Resolution",
      "Core",
      "Secondary",
    ];
    let tagsHTML = belowTheFoldTags
      .map((tag) => {
        let tagValue = bill[tag];
        if (tagValue) return `<li>${tag}</li>`;
        return "";
      })
      .join("");
    if (tagsHTML === "") return "";
    return `
      <div class="tag-section">
        <div class="tag-list-header">TAGS</div>
        <ul class="tag-list">
          ${tagsHTML}
        </ul>
      </div>
      `;
  };

  const supportIfExists = (support) => {
    console.log("support:", support);
    console.log("support length:", support.length);
    if (!support.trim()) return "";
    return `
      <div class="bill-section-spacer"></div>
      <div class="bill-label">Support</div>
      <p>
      ${linksToHTML(stringToList(support))}
      </p>
    `;
  };

  const notesIfExists = (notes) => {
    // console.log("notes:", notes);
    // console.log("notes length:", notes.length);
    if (!notes.trim()) return "";
    return `
      <div class="bill-section-spacer"></div>
      <div class="bill-label">Notes</div>
      <p>
      ${linksToHTML(stringToList(notes))}
      </p>
    `;
  };

  const linksToHTML = (text) => {
    const sections = text.split("]]");
    if (sections.length === 1) return text;
    console.log("sections: ", sections);
    console.log("------============++++++++++++==========-------------");
    let revisedSections = sections.map((section) => {
      if (section == "") return "";
      console.log("section", section);
      let split = section.split("[[");
      if (split.length === 1) return section;
      console.log("split", split);
      let linkOnly = split.slice(-1)[0].trim();
      console.log("linkOnly", linkOnly);
      let linkOnlySplit = linkOnly.split(" ");
      if (linkOnlySplit.length === 1) return split.join("");
      let url = linkOnlySplit.slice(-1)[0];
      let html = `<a href="${url}">${linkOnlySplit.slice(0, -1).join(" ")}</a>`;
      console.log(
        "mapping return pre-replacement: ",
        split.slice(0, -1).join("")
      );
      return split.slice(0, -1).join("") + html;
    });
    console.log("------============++++++++++++==========-------------");
    console.log("revised sections: ", revisedSections);
    return revisedSections.join("");
  };

  const aboveTheFoldFiltersTemplate = (bill) => {
    const mainFilterData = [
      { text: "116th Congress", prop: "116th", file: "congress.jpg" },
      { text: "117th Congress", prop: "117th", file: "congress.jpg" },
      { text: "118th Congress", prop: "118th", file: "congress.jpg" },
      { text: "Democrat", prop: "Democrat", file: "democrat.jpg" },
      { text: "Republican", prop: "Republican", file: "republican.jpg" },
      { text: "Independent", prop: "Independent", file: "independent.jpg" },
      { text: "Bipartisan", prop: "Bipartisan", file: "bipartisan.jpg" },
      { text: "Introduced", prop: "Introduced", file: "calendar.jpg" },
      { text: "Last Action", prop: "Last Action", file: "calendar-last.jpg" },
      { text: "Core Soil Health Bill", prop: "Core", file: "core.jpg" },
      {
        text: "Secondary Soil Health Bill",
        prop: "Secondary",
        file: "secondary.jpg",
      },
    ];

    let elements = [];

    mainFilterData.forEach((filter) => {
      if (bill[filter.prop]) {
        elements.push(`
        <div class="icon-plus-text">
          <img src="./icons/${filter.file}" class="icon" />
          <div class="text">
            ${filter.text}${
          filter.text == "Introduced" || filter.text == "Last Action"
            ? " " + bill[filter.prop].toLocaleDateString("en-US")
            : ""
        }
          </div>
        </div>`);
      }
    });

    return `<div class="sidebar-icons">${elements.join("")}</div>`;
  };

  const displayBills = (bills = allBillsArray) => {
    // showThisMany
    console.log("DISPLAY BILLS: ", bills);
    const billsElement = document.querySelector("#bills");
    if (bills.length == 0) {
      billsElement.innerHTML = "<h3>There are no bills to display.<h3>";
      return;
    }
    // console.log("displayBills: ", bills);
    // console.log(billTemplate(bills[0]));
    if (anyFiltersChecked()) {
      showBills = bills.map((bill) => billTemplate(bill));
      billsElement.innerHTML = showBills.join("");
    } else {
      // only limit display quantity and show more button when all filters off
      let showBills = bills.slice(0, showThisMany);
      showBills = showBills.map((bill) => billTemplate(bill));
      // console.log(allBills.join(""));
      let moreButtonHTML =
        showBills.length < allBillsArray.length
          ? "<div id='more'><button>Show More</button></div>"
          : "";
      billsElement.innerHTML = showBills.join("") + moreButtonHTML;
    }
    addShowHideClickEvents();
    initMoreButton();
  };

  const addShowHideClickEvents = () => {
    const tracker = document.querySelector("#tracker");
    const legislators = document.querySelector("#legislators");
    const openLegislators = document.querySelector("#openLegislators");
    const openBillTracker = document.querySelector("#openBillTracker");

    openBillTracker.addEventListener("click", (e) => {
      openBillTracker.classList.add("active");
      openLegislators.classList.remove("active");
      tracker.style.display = "flex";
      legislators.style.display = "none";
    });
    openLegislators.addEventListener("click", () => {
      openBillTracker.classList.remove("active");
      openLegislators.classList.add("active");
      tracker.style.display = "none";
      legislators.style.display = "flex";
    });

    // function openCity(evt, cityName) {
    //   // Declare all variables
    //   var i, tabcontent, tablinks;

    //   // Get all elements with class="tabcontent" and hide them
    //   tabcontent = document.getElementsByClassName("tabcontent");
    //   for (i = 0; i < tabcontent.length; i++) {
    //     tabcontent[i].style.display = "none";
    //   }

    //   // Get all elements with class="tablinks" and remove the class "active"
    //   tablinks = document.getElementsByClassName("tablinks");
    //   for (i = 0; i < tablinks.length; i++) {
    //     tablinks[i].className = tablinks[i].className.replace(" active", "");
    //   }

    //   // Show the current tab, and add an "active" class to the button that opened the tab
    //   document.getElementById(cityName).style.display = "block";
    //   evt.currentTarget.className += " active";
    // }

    const billShowHideButtons = document.querySelectorAll(".bill-showhide");
    for (let i = 0; i < billShowHideButtons.length; i++) {
      billShowHideButtons[i].addEventListener("click", function () {
        let textElement = this.querySelector(".showhide-text");
        this.classList.toggle("active");
        //get "bill-summary" element
        var content = $(this.parentNode.querySelector(".bill-summary"));
        // var sidebarTags = $(this.parentNode.querySelector(".tag-section"));
        var sidebarTags = this.parentNode.querySelectorAll(".tag-section");
        console.log("sidebar tags thius:", this);
        console.log("sidebar tags thius parent:", this.parentNode);
        // console.log(
        //   "sidebar tags:",
        //   this.parentNode.querySelector(".tag-section")
        // );
        // var content = $(
        //   this.previousElementSibling.previousElementSibling.children[1]
        // );
        // if (content.style.display === "block") {
        if (this.classList.contains("active")) {
          // content.style.marginTop = "16px";
          textElement.innerHTML = "SHOW LESS";
          // content.style.maxHeight = "100vh";
          content.slideDown(250);
          // sidebarTags.show();
          sidebarTags.forEach((tagDiv) => {
            tagDiv.style.display = "flex";
          });
          // sidebarTags.style.display = "block";
        } else {
          // content.style.marginTop = "0px";
          textElement.innerHTML = "SHOW DETAILS";
          // content.style.display = "none";
          // content.style.maxHeight = "0px";
          content.slideUp(250);
          // sidebarTags.hide();
          sidebarTags.forEach((tagDiv) => {
            tagDiv.style.display = "none";
          });
          // sidebarTags.style.display = "none";
        }
      });
    }
  };

  // const tagNames = [
  //   { id: 'democrat', title: 'Democrat'},
  //   { id: 'democrat', title: 'Republican'},
  //   { id: 'Independent', title: 'Independent'},
  //   { id: 'Bipartisan', title: 'Bipartisan'},
  //   { id: 'democrat', title: 'Practical Infrastructure'},
  //   { id: 'democrat', title: 'Omnibus Bill'},
  //   { id: 'democrat', title: 'New Incentive'},
  // ]

  const filterTags = [
    {
      title: "IMPORTANCE TO SOIL HEALTH",
      tags: ["Core", "Secondary"],
    },
    {
      title: "CHAMBER",
      tags: ["House", "Senate", "Bicameral"],
    },
    {
      title: "PARTY SUPPORT",
      tags: ["Democrat", "Republican", "Independent", "Bipartisan"],
    },
    {
      title: "CONGRESS",
      tags: ["116th", "117th", "118th"],
    },
    {
      title: "BILL TYPE",
      tags: ["Omnibus Package", "Resolution"],
    },
    {
      title: "ISSUE AREAS",
      tags: [
        "Soil Health",
        "Livestock/Grazing",
        "Local/Regional Food Systems",
        "Ag Infrastructure",
        "Forestry",
        "Wildfire",
        "Row Crops",
        "Finance",
        "Taxes",
        "Incentives",
        "Regional Infrastructure",
        "Research",
        "Crop Insurance",
        "Marker Bill",
        "Regulation",
        "Removing Barriers",
      ],
    },
  ];

  const initMoreButton = () => {
    const moreButton = document.querySelector("#more button");
    if (moreButton) {
      // console.log("more button: ", moreButton);
      moreButton.addEventListener("click", (e) => moreButtonAction());
    }
  };

  const moreButtonAction = (e) => {
    showThisMany += addThisMany;
    // console.log("more ", showThisMany);
    displayBills();
  };

  const initFilters = () => {
    const filterElement = document.querySelector("#filters");
    // let filterHTML = "";
    filterHTML = `
      <div id="close-filters"></div>
      <h3>Filter by:</h3>
      <form id="search-form">
        <button type="submit">Search</button>
        <input type="search" placeholder="Search...">
      </form>
      <div id="filter-sections">
        <div class="filter-section-group">`;
    const tagsHTML = filterTags.forEach((tagObject, idx) => {
      const isLast = filterTags.length == idx + 1;
      const isSecond = idx == 1;
      if (isLast) filterHTML += `</div><div class="filter-section-group">`;
      let rule = idx == 1 ? "rule" : "";
      filterHTML += `<div class="filter-section ${rule}">`;
      filterHTML += tagTitleTemplate(tagObject.title);
      filterHTML += tagObject.tags
        .map((tagName) => {
          return tagCheckboxTemplate(tagName);
        })
        .join("");
      filterHTML += `</div>`;
      // if (isLast) filterHTML += `</div>`;
    });
    filterHTML += `
      </div></div>
        <a href="#" id="clear-filters">Clear All Filters</a>
      </div>
      `;
    filterElement.innerHTML = filterHTML;

    // console.log(tagName);
    // console.log(tagsHTML);
    setFormActions();
    setFilterActions();
  };

  const setFormActions = () => {
    document.querySelector("#search-form").onsubmit = clickSearch;
    document
      .querySelector("#clear-filters")
      .addEventListener("click", clearFilters);
    //clear search when X close is hit in search bar
    document
      .querySelector("#search-form")
      .addEventListener("search", clearSearchInput);
  };

  const clearFilters = (e) => {
    e.preventDefault();
    //clear checkboxes
    const checkboxes = document.querySelectorAll(
      "#filters input[type=checkbox]"
    );
    checkboxes.forEach((box) => (box.checked = false));
    document.querySelector("#filters input[type=search]").value = "";
    displayBills();
  };

  const setFilterActions = () => {
    const checkBoxes = document.querySelectorAll("#filters .tagCheckbox");
    checkBoxes.forEach(
      (checkbox) => checkbox.addEventListener("change", (e) => clickSearch())
      // checkbox.addEventListener("change", (e) => filterBills())
    );
    document.querySelector("#show-filters").addEventListener("click", (e) => {
      setModalFiltersVisibility(true);
    });
    document.querySelector("#close-filters").addEventListener("click", (e) => {
      setModalFiltersVisibility(false);
    });
  };

  const setModalFiltersVisibility = (visible = true) => {
    if (visible) {
      document.querySelector("#tracker").classList.add("show-modal-filters");
    } else {
      document.querySelector("#tracker").classList.remove("show-modal-filters");
    }
  };

  const clickSearch = (e) => {
    if (e) e.preventDefault();
    console.log("clicksearch: ", e);
    const term = document
      .querySelector("#search-form input")
      .value.trim()
      .toLowerCase();
    if (term === "") {
      console.log("search empty");
      filterBills();
      return;
    }
    // console.log(
    //   "click search: ",
    //   JSON.stringify(Object.values(allBillsArray[0]).join("").toLowerCase())
    // );
    const billsWithTerm = allBillsArray.filter((bill) => {
      const billText = Object.values(bill).join("").toLowerCase();
      return billText.includes(term);
    });
    filterBills(billsWithTerm);
  };

  const clearSearchInput = (e) => {
    // console.log("search event detced");
    if (event) event.preventDefault();
    // console.log("search event: ", event);
    const term = document
      .querySelector("#search-form input")
      .value.trim()
      .toLowerCase();
    // console.log("search term: ", term);
    if (term === "") filterBills();
  };

  const filterBills = (bills = allBillsArray) => {
    // console.log("filter bills");
    const filters = getCheckedFilters();
    console.log("FILTERBILLS filters:", filters);
    console.log("FILTERBILLS bills passed in:", bills);
    if (filters.length === 0) {
      console.log("no filters!");
      displayBills(bills);
      return;
    }
    // create array of bill objects from allBillsArray
    // and pass to displayBills(bills)
    console.log("filterING!");
    displayBills(
      bills.filter((bill) => {
        return filters.some((filterName) => {
          // console.log(filterName);
          // console.log(bill[filterName]);
          return bill[filterName];
        });
      })
    );
  };

  const anyFiltersChecked = () => {
    getCheckedFilters().length;
  };

  const getCheckedFilters = () => {
    const checkBoxes = document.querySelectorAll("#filters .tagCheckbox");
    filterNames = [];
    checkBoxes.forEach((checkBox) => {
      if (checkBox.checked) filterNames.push(checkBox.name);
    });
    // console.log(filterNames)
    return filterNames;
  };

  const tagCheckboxTemplate = (tagName) => {
    let tagText = tagName;
    if (tagName == "Democrat") tagText = "Democrat Only";
    if (tagName == "Republican") tagText = "Republican Only";
    return `
      <label class="filter-check">
      <input class="tagCheckbox" type="checkbox" name="${tagName}" />
      <span>${tagText}</span>
      </label>`;
  };

  const tagTitleTemplate = (tagTitle) => {
    return `<div class="filter-section-title">${tagTitle}</div>`;
  };

  initFilters();
  start();
  // addShowHideClickEvents();
});
