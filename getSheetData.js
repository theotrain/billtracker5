const getSheetData = ({ sheetName, query, callback }) => {
  console.log(sheetName, query);
  const sheetID = "1zU2Cm2-x1jkVepVojH42u0y6RKCvEUDcfeBhEeyrKhg";
  const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?`;
  // const sheetName1 = "bills";
  // const sheetName2 = "legislators";
  // const query = encodeURIComponent("Select *");
  // --==== QUERY EXAMPLES ====--
  // --==== USE LETTERS FOR COLUMN NAMES ====--
  // let qry = 'SELECT A,C,D WHERE D > 150';
  // qry = 'SELECT * WHERE B ="Maher"';
  // qry = 'SELECT * WHERE A contains "Jo"';
  // qry = 'SELECT * WHERE C = "active" AND B contains "Jo"';
  // qry = "SELECT * WHERE E > date '2022-07-9' ORDER BY E DESC";
  const url = `${base}&sheet=${sheetName}&tq=${encodeURIComponent(query)}`;
  const data = [];
  // let bills;

  fetch(url)
    .then((res) => res.text())
    .then((response) => {
      // const jsData = JSON.parse(response.substr(47).slice(0, -2));
      // console.log(jsData);
      console.log(responseToObjects(response));
      callback(responseToObjects(response));
      // console.log(bills);
    });

  const responseToObjects = (res) => {
    const jsData = JSON.parse(res.substring(47).slice(0, -2));
    let data = [];
    const columns = jsData.table.cols;
    const rows = jsData.table.rows;
    let rowObject;
    let cellData;
    let propName;
    for (let r = 0, rowMax = rows.length; r < rowMax; r++) {
      rowObject = {};
      for (let c = 0, colMax = columns.length; c < colMax; c++) {
        cellData = rows[r]["c"][c];
        propName = columns[c].label;
        if (cellData === null) {
          rowObject[propName] = "";
        } else if (
          typeof cellData["v"] == "string" &&
          cellData["v"].startsWith("Date")
        ) {
          rowObject[propName] = new Date(cellData["f"]);
        } else {
          rowObject[propName] = cellData["v"];
        }
      }
      data.push(rowObject);
    }
    return data;
  };
};
