document.title = "O código funciona";

document.getElementById("avatar").style.backgroundImage =
  "url('https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";

class Auth {
  constructor() {
    this.token = localStorage.getItem("token");
    this.loginModal = document.getElementById("loginModal");
    if (!this.token) {
      this.openLoginModal();
    }
  }
  logout = () => {
    localStorage.removeItem("token");
    this.openLoginModal();
  };

  openLoginModal = () => {
    this.loginModal.showModal();
  };

  closeLoginModal = () => {
    this.loginModal.close();
  };

  login = (event) => {
    event.preventDefault();
    const email = document.getElementById("user").value;
    const password = document.getElementById("password").value;
    if (email === "admin" && password === "admin") {
      localStorage.setItem("token", "123456");
      this.closeLoginModal();
    } else {
      alert("Invalid credentials");
    }
  };
}

class Calendar {
  constructor() {
    this.calendarElement = document.getElementById("calendar");
    this.calendarData = [];
    this.month = new Date().getMonth();
    this.year = new Date().getFullYear();
    this.buildCalendarData(this.month, this.year);
  }

  changeMonth = (direction) => {
    if (direction === "next") {
      this.month++;
      if (this.month > 11) {
        this.month = 0;
        this.year++;
      }
    } else {
      this.month--;
      if (this.month < 0) {
        this.month = 11;
        this.year--;
      }
    }
    this.buildCalendarData(this.month, this.year);
  };

  buildCalendarData = (
    month = new Date().getMonth(),
    year = new Date().getFullYear()
  ) => {
    let today = new Date();
    if (month !== new Date().getMonth() || year !== new Date().getFullYear()) {
      today = new Date(year, month);
    }
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const calendarData = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
      let week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      calendarData.push(week);
    }
    this.calendarData = calendarData;
    this.buildCalendarTable();
  };

  buildCalendarTable = () => {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const headerRow = document.createElement("tr");
    const headers = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    this.calendarData.forEach((week) => {
      const row = document.createElement("tr");
      week.forEach((day) => {
        const td = document.createElement("td");
        if (day) {
          td.setAttribute(
            "data-day",
            new Date(this.year, this.month, day).toISOString()
          );
          if (
            day === new Date().getDate() &&
            this.month === new Date().getMonth() &&
            this.year === new Date().getFullYear()
          ) {
            console.log("today");
            console.log(day);
            td.innerHTML = `<div class='day today'>${day}</div>`;
          } else {
            td.innerHTML = `<div class='day'>${day}</div>`;
          }
        }
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(thead);
    table.appendChild(tbody);

    let thisMonth = new Date(
      new Date().setMonth(this.month)
    ).toLocaleDateString("pt-BR", { month: "long" });
    let thisYear = new Date(new Date().setFullYear(this.year)).getFullYear();
    this.calendarElement.innerHTML = `<h2>${thisMonth}/${thisYear}</h2>`;
    this.calendarElement.appendChild(table);
  };
}

let calendar = null;
let auth = null;

const mounted = () => {
  window.onload = () => {
    auth = new Auth();
    calendar = new Calendar();
    console.log(calendar);
  };
};

mounted();
