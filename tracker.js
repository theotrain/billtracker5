window.addEventListener("DOMContentLoaded", (event) => {
  let allBillsArray = [];
  let showThisMany = 30;
  const addThisMany = 30;
  let showingBills = 0;
  let allBillsLoaded = false;
  let displayBillsSection = true;

  const issueAreaTags = [
    "Soil Health",
    "Conservation Practices and Programs",
    "Landscapes / Public Lands",
    "Livestock / Grazing",
    "Local / Regional Food Systems",
    "Food Security",
    "Ag Infrastructure / Supply Chain",
    "Forestry / Wildfire",
    "Water Issues",
    "Row Crops",
    "Concentration / Anti-trust",
    "Jobs",
    "Finance",
    "Funding / Incentives / Grants",
    "Taxes",
    "Technical Assistance",
    "Climate / Carbon Sequestration",
    "Research",
    "Crop Insurance",
    "New Regulation",
    "Deregulation",
    "Removing Barriers",
    "Marker Bill",
  ];

  const start = () => {
    getSheetData({
      sheetName: "bills",
      query: "SELECT * WHERE H > date '2021-08-1' ORDER BY H DESC",
      callback: getBillsResponse1,
    });
  };

  const billNumberToFullText = (num) => {
    // get number like "H.R.5376", return "House Bill H.R.5376"
    if (num.includes(" ")) {
      num = num.split(" ").join("");
    }
    if (num.startsWith("H.Con.Res")) {
      return "House Concurrent Resolution " + num;
    }
    if (num.startsWith("S.Con.Res")) {
      return "Senate Concurrent Resolution " + num;
    }
    if (num.startsWith("H.Res")) {
      return "House Resolution " + num;
    }
    if (num.startsWith("S.Res")) {
      return "Senate Resolution " + num;
    }
    if (num.startsWith("H.R")) {
      return "House Bill " + num;
    }
    if (num.startsWith("S.")) {
      return "Senate Bill " + num;
    }
    return num;
    // S.Res.43 -> Senate Resolution S.Res.43
    // H.Res.427 -> House Resolution H.Res.427
    // H.R.3684 -> House Bill H.R.3684
    // S.2522 -> Senate Bill S.2522
    // H.Con.Res.88 -> House Concurrent Resolution H.Con.Res.88
    // S.Con.Res.14 -> Senate Concurrent Resolution S.Con.Res.14
  };

  const getBillsResponse1 = (bills) => {
    //bill is array of objects
    allBillsArray = bills;
    displayBills(allBillsArray);
    console.log("first bills loaded: ", bills);
    // let filters = document.querySelector("#filters");
    // if (filters) filters.style = "display: flex";

    getSheetData({
      sheetName: "bills",
      query: "SELECT * WHERE H <= date '2021-08-1' ORDER BY H DESC",
      callback: getBillsResponse2,
    });
    // loadContainerQueryPolyfill();
  };

  const getBillsResponse2 = (bills) => {
    //bill is array of objects
    allBillsArray.push(...bills);
    allBillsLoaded = true;
    let spinner = document.querySelector("#more .spinner");
    if (spinner) spinner.style = "display: none";
    // displayBills(allBillsArray);
    console.log("second bills loaded: ", bills);
    console.log("new all bills: ", allBillsArray);
    processCompanionLinks();
    showAllBillDates();
    // loadContainerQueryPolyfill();
  };

  const showAllBillDates = () => {
    console.log("ALL BILLS LOADED, DATES:");
    allBillsArray.forEach((bill) => {
      console.log(bill["Number"], bill["Last Action"]);
    });
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
    return paragraphs.replace(regex, "<br />");
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
    const committees = bill["Committees"];
    const agencies = bill["Agencies"];
    const democrat = bill["Democrat Only"];
    const republican = bill["Republican Only"];
    const independent = bill["Independent Only"];
    const bipartisan = bill["Bipartisan"];
    const boldChanges = bill["Bold Changes"];
    const practical = bill["Practical Infrastructure"];
    const omnibus = bill["Omnibus Bill"];
    const newIncentive = bill["New Incentive"];
    const cosponsorsD = bill["Cosponsors (D)"].trim();
    const cosponsorsR = bill["Cosponsors (R)"].trim();
    const cosponsorsI = bill["Cosponsors (I)"].trim();

    let sponsorClass = "democrat";
    if (sponsor.toLowerCase().includes("(r")) sponsorClass = "republican";
    if (sponsor.toLowerCase().includes("(i")) sponsorClass = "independent";

    return `<div class="bill">
        <div class="bill-main">
          <div class="bill-header">
            <a href="${link}" target="_blank" class="bill-number">
              ${billNumberToFullText(number)}
            </a>
            ${companionBillTemplate(bill)}
            <div class="title">${name}</div>

            <div class="bill-label">Lead Sponsor</div>
            <div class="sponsor ${sponsorClass}">${sponsor}</div>
            <div class="cosponsor-quantity">/ ${quantity} Cosponsors</div>
            <div class="bill-progress-wrap">
              <div class="bill-progress">
                ${progressTemplate(bill)}
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
            ${analysisIfExists(analysis)}
            ${notesIfExists(notes)}
            ${cosponsorsTemplate(cosponsorsD, cosponsorsR, cosponsorsI)}
            ${committeesIfExists(committees)}
            ${agenciesIfExists(agencies)}
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

  const progressTemplate = (bill) => {
    const progress1 = bill["Approved By Committee"];
    const progress2 = bill["Passed House"];
    const progress3 = bill["Passed Senate"];
    const progress4 = bill["To President"];
    const progress5 = bill["Passed"];
    const resolution = bill["Resolution"];
    const number = bill["Number"];

    if (resolution) {
      console.log("resolution in: ", resolution);
      let agreedText = "Agreed to in House";
      if (number.startsWith("S")) {
        agreedText = "Agreed to in Senate";
      }
      return `
      <ul>
        <li class="active">Introduced</li>
        <li ${progress5 ? 'class="active"' : ""}>${agreedText}</li>
      </ul>
      `;
    }

    return `
    <ul>
      <li class="active">Introduced</li>
      <li ${progress1 ? 'class="active"' : ""}>Approved By Committee</li>
      <li ${progress2 ? 'class="active"' : ""}>Passed House</li>
      <li ${progress3 ? 'class="active"' : ""}>Passed Senate</li>
      <li ${progress4 ? 'class="active"' : ""}>To President</li>
      <li ${progress5 ? 'class="active"' : ""}>Became Law</li>
    </ul>`;
  };

  const getBillByNumber = (num) => {
    for (let i = 0, len = allBillsArray.length; i < len; i++) {
      // console.log("looking for bill num: ", num);
      // console.log("i: ", i);
      if (allBillsArray[i]["Number"] == num) {
        // console.log("we found something i: ", i);
        return allBillsArray[i];
      }
    }
    return { link: "#" };
  };

  const processCompanionLinks = () => {
    //called after full load of bills is complete
    //triggers a redraw of all companion bills on the page to be links
    const comps = document.querySelectorAll(".companion-section");
    console.log(`found ${comps.length} companioin sections`);
    comps.forEach((companion) => {
      const billNumber = companion.dataset.number;
      const companionLink = getBillByNumber(billNumber)["Link"];
      companion.innerHTML = `<a href=${companionLink} target="_blank"  class="companion-bill">Companion Bill: ${billNumberToFullText(
        billNumber
      )}</a>`;
    });
    //
  };

  const companionBillTemplate = (bill) => {
    const companionNum = bill["Companion Bill"].trim();
    const bicameral = bill["Bicameral"];
    if (bicameral && companionNum != "") {
      if (allBillsLoaded) {
        const companionLink = getBillByNumber(companionNum)["Link"];
        return `<span class="companion-section" data-number="${companionNum}"><a href=${companionLink} target="_blank" class="companion-bill">Companion Bill: ${billNumberToFullText(
          companionNum
        )}</a></span>`;
      } else {
        return `<span class="companion-section" data-number="${companionNum}"><span class="companion-bill">Companion Bill: ${billNumberToFullText(
          companionNum
        )}</span></span>`;
      }
    }
    return "";
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
  };

  const listFilters = (bill) => {
    // const belowTheFoldTags = [
    //   "Soil Health",
    //   "Livestock/Grazing",
    //   "Local/Regional Food Systems",
    //   "Ag Infrastructure",
    //   "Forestry",
    //   "Wildfire",
    //   "Row Crops",
    //   "Finance",
    //   "Taxes",
    //   "Incentives",
    //   "Regional Infrastructure",
    //   "Research",
    //   "Crop Insurance",
    //   "Marker Bill",
    //   "Regulation",
    //   "Removing Barriers",
    //   "Omnibus Package",
    //   "Resolution",
    //   "Core",
    //   "Secondary",
    // ];

    let tagsHTML = issueAreaTags
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

  const committeesIfExists = (committees) => {
    // console.log("support:", support);
    // console.log("support length:", support.length);
    if (!committees.trim()) return "";

    // Agriculture - Subcommittee on Nutrition, Oversight, and Department Operations; Rules
    htmlString = '<div class="committee-section">';
    htmlString += '<div class="tiny-label">COMMITTEES</div>';
    const comms = committees.split(";");
    comms.forEach((com) => {
      commSections = com.split("-");
      if (commSections.length > 1) {
        // in here means there are subsections
        htmlString += `<div class="committee">${commSections[0].trim()}</div>`;
        const subs = commSections[1].split("&");
        subs.forEach((sub) => {
          htmlString += `<div class="subcommittee">${sub.trim()}</div>`;
        });
      } else {
        htmlString += `<div class="committee">${com.trim()}</div>`;
      }
    });
    htmlString += "</div>";
    return htmlString;

    // return `
    //   <div class="committee-section">
    //     <div class="tiny-label">COMMITTEES</div>
    //     <hr />
    //     <div class="committee">Health and Human Flourishing</div>
    //     <div class="subcommittee">Ordinary greatness</div>
    //     <div class="subcommittee">Homemaking arts for all the married ladies</div>
    //     <div class="committee">Health and Human Flourishing</div>
    //     </div>
    //     `;
  };

  const agenciesIfExists = (agencies) => {
    // console.log("support:", support);
    // console.log("support length:", support.length);
    if (!agencies.trim()) return "";
    return `
    <div class="committee-section">
    <div class="tiny-label">AGENCIES</div>
    <div class="agency">${agencies}</div>
    </div>
  `;
  };

  const supportIfExists = (support) => {
    // console.log("support:", support);
    // console.log("support length:", support.length);
    if (!support.trim()) return "";
    return `
      <div class="bill-section-spacer"></div>
      <div class="bill-label">Support</div>
      <p>
      ${linksToHTML(stringToList(support))}
      </p>
    `;
  };

  const analysisIfExists = (analysis) => {
    // console.log("support:", support);
    // console.log("support length:", support.length);
    if (!analysis.trim()) return "";
    return `
      <div class="bill-label">Analysis</div>
      <p>
      ${analysis}
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
    // console.log("sections: ", sections);
    // console.log("------============++++++++++++==========-------------");
    let revisedSections = sections.map((section) => {
      if (section == "") return "";
      // console.log("section", section);
      let split = section.split("[[");
      if (split.length === 1) return section;
      // console.log("split", split);
      let linkOnly = split.slice(-1)[0].trim();
      // console.log("linkOnly", linkOnly);
      let linkOnlySplit = linkOnly.split(" ");
      if (linkOnlySplit.length === 1) return split.join("");
      let url = linkOnlySplit.slice(-1)[0];
      let html = `<a href="${url}">${linkOnlySplit.slice(0, -1).join(" ")}</a>`;
      // console.log(
      // "mapping return pre-replacement: ",
      // split.slice(0, -1).join("")
      // );
      return split.slice(0, -1).join("") + html;
    });
    // console.log("------============++++++++++++==========-------------");
    // console.log("revised sections: ", revisedSections);
    return revisedSections.join("");
  };

  const aboveTheFoldFiltersTemplate = (bill) => {
    const mainFilterData = [
      { text: "116th Congress", prop: "116th", file: "congress.jpg" },
      { text: "117th Congress", prop: "117th", file: "congress.jpg" },
      { text: "118th Congress", prop: "118th", file: "congress.jpg" },
      { text: "Democrat", prop: "Democrat Only", file: "democrat.jpg" },
      { text: "Republican", prop: "Republican Only", file: "republican.jpg" },
      {
        text: "Independent",
        prop: "Independent Only",
        file: "independent.jpg",
      },
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
        // place text "senate, house, bicameral" before "117th congress"
        if (filter.file == "congress.jpg") {
          if (bill["Bicameral"]) {
            filter.text = "Bicameral " + filter.text;
          } else if (bill["Number"].startsWith("S")) {
            filter.text = "Senate " + filter.text;
          } else if (bill["Number"].startsWith("H")) {
            filter.text = "House " + filter.text;
          }
        }

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

  const displayBills = (bills = allBillsArray, isFiltered = false) => {
    // showThisMany
    let showingAllBills = bills === allBillsArray;
    showingBills = bills.length;
    console.log("showingAllBills: ", showingAllBills);
    console.log("showingBills: ", showingBills);
    const billsElement = document.querySelector("#bills");
    if (bills.length == 0) {
      billsElement.innerHTML = "<h3>There are no bills to display.<h3>";
      return;
    }
    // console.log("displayBills: ", bills);
    // console.log(billTemplate(bills[0]));
    if (isFiltered) {
      console.log("showing filtered bills: ", bills);
      showBills = bills.map((bill) => billTemplate(bill));
      billsElement.innerHTML = showBills.join("");
    } else {
      // only limit display quantity and show more button when all filters off
      let showBills = bills.slice(0, showThisMany);
      showingBills = showBills.length;
      showBills = showBills.map((bill) => billTemplate(bill));
      // console.log(allBills.join(""));
      console.log("showing unfiltered bills: ", bills);
      console.log(
        "showing more?: ",
        showingAllBills && showBills.length < allBillsArray.length
      );
      let moreButtonHTML =
        showingAllBills && showBills.length < allBillsArray.length
          ? showMoreButtonTemplate()
          : "";
      billsElement.innerHTML = showBills.join("") + moreButtonHTML;
    }
    addShowHideClickEvents();
    initMoreButton();
  };

  const showMoreButtonTemplate = () => {
    if (allBillsLoaded) {
      return `
      <div id='more'>
        <button>Show More</button>
      </div>`;
    } else {
      return `
      <div id='more'>
      <button>Show More</button>
      <div class="spinner">
          <div class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          LOADING BILLS...
        </div>
    </div>`;
    }
  };

  const addShowHideClickEvents = () => {
    const tracker = document.querySelector("#tracker");
    const legislators = document.querySelector("#legislators");
    // const openLegislators = document.querySelector("#openLegislators");
    // const openBillTracker = document.querySelector("#openBillTracker");

    const toggleBillsLegislators = document.querySelector(".switch-button");
    // const toggleAnimated = document.querySelector(".switch-button-label");

    // displayBillsSection
    //.switch-button-label:before

    // toggleAnimated.addEventListener("animationend", (e) => {
    //   if (displayBillsSection) {
    //     tracker.style.display = "none";
    //     legislators.style.display = "flex";
    //   } else {
    //     tracker.style.display = "flex";
    //     legislators.style.display = "none";
    //   }
    //   displayBillsSection = !displayBillsSection;
    // });

    toggleBillsLegislators.addEventListener("click", (e) => {
      setTimeout(() => {
        if (displayBillsSection) {
          tracker.style.display = "none";
          legislators.style.display = "flex";
        } else {
          tracker.style.display = "flex";
          legislators.style.display = "none";
        }
        displayBillsSection = !displayBillsSection;
      }, 200);
    });

    // openBillTracker.addEventListener("click", (e) => {
    //   openBillTracker.classList.add("active");
    //   openLegislators.classList.remove("active");
    //   tracker.style.display = "flex";
    //   legislators.style.display = "none";
    // });
    // openLegislators.addEventListener("click", () => {
    //   openBillTracker.classList.remove("active");
    //   openLegislators.classList.add("active");
    //   tracker.style.display = "none";
    //   legislators.style.display = "flex";
    // });

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
        // console.log("sidebar tags thius:", this);
        // console.log("sidebar tags thius parent:", this.parentNode);
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
          textElement.innerHTML = "SHOW MORE";
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
      tags: [
        "Democrat Only",
        "Republican Only",
        "Independent Only",
        "Bipartisan",
      ],
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
      tags: issueAreaTags,
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
      <div id="close-filters">APPLY<img src="./icons/close.svg" /></div>
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
    filterBills(billsWithTerm, true);
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

  const filterBills = (bills = allBillsArray, isFiltered = false) => {
    // console.log("filter bills");
    // const filters = getCheckedFilters();
    const filters = getCheckedFiltersExceptCoreSecondary();
    console.log("FILTERBILLS filters:", filters);
    console.log("filterING!");
    // make sure core and secondary filter first to exlude AND
    if (isChecked("Core") && !isChecked("Secondary")) {
      //remove all bills that are not core
      isFiltered = true;
      bills = bills.filter((bill) => {
        // console.log("bill core:", bill["Core"]);
        if (bill["Core"]) return true;
        return false;
      });
      console.log("AFTER REMOVIng copre filters: ", bills);
    }
    if (isChecked("Secondary") && !isChecked("Core")) {
      isFiltered = true;
      //remove all bills that are not secondary
      bills = bills.filter((bill) => {
        // console.log("bill core:", bill["Core"]);
        if (bill["Secondary"]) return true;
        return false;
      });
      console.log("AFTER REMOVIng secondary filters: ", bills);
    }
    console.log("FILTERBILLS bills passed in:", bills);
    if (filters.length === 0) {
      console.log("no filters!");
      displayBills(bills, isFiltered);
      return;
    }
    // create array of bill objects from allBillsArray
    // and pass to displayBills(bills)
    displayBills(
      bills.filter((bill) => {
        return filters.some((filterName) => {
          // console.log(filterName);
          // console.log(bill[filterName]);
          return bill[filterName];
        });
      }),
      true
    );
  };

  const anyFiltersChecked = () => {
    getCheckedFilters().length > 0;
  };

  const getCheckedFiltersExceptCoreSecondary = () => {
    const checkBoxes = document.querySelectorAll("#filters .tagCheckbox");
    filterNames = [];
    checkBoxes.forEach((checkBox) => {
      if (
        checkBox.checked &&
        checkBox.name !== "Core" &&
        checkBox.name !== "Secondary"
      )
        filterNames.push(checkBox.name);
    });
    // console.log(filterNames)
    return filterNames;
  };

  const getCheckedFilters = () => {
    const checkBoxes = document.querySelectorAll("#filters .tagCheckbox");
    filterNames = [];
    checkBoxes.forEach((checkBox) => {
      if (checkBox.checked) filterNames.push(checkBox.name);
    });
    console.log(filterNames);
    return filterNames;
  };

  const isChecked = (filterName) => {
    const checkBox = document.querySelector(
      `#filters .tagCheckbox[name=${filterName}]`
    );
    return checkBox.checked;
  };

  const tagCheckboxTemplate = (tagName) => {
    let tagText = tagName;
    // if (tagName == "Democrat") tagText = "Democrat Only";
    // if (tagName == "Republican") tagText = "Republican Only";
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
