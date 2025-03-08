document.getElementById("avatar").style.backgroundImage =
  "url('https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";

const zeroPad = (num, places) => String(num).padStart(places, "0");

class Auth {
  constructor() {
    this.schedules = [];
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
          td.addEventListener("click", (event) => {
            this.openScheduleModal(event);
          });
          if (
            day === new Date().getDate() &&
            this.month === new Date().getMonth() &&
            this.year === new Date().getFullYear()
          ) {
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
    let currentMonthElement = document.getElementById("currentMonth");
    currentMonthElement.innerHTML = `<h2>${thisMonth} de ${thisYear}</h2>`;
    this.calendarElement.innerHTML = "";
    this.calendarElement.appendChild(table);
    this.plotSchedules();
  };

  getSchedules = () => {
    this.schedules = [
      {
        date: new Date().toISOString(),
        mine: true,
        title: "Reunião com a equipe",
        description: "Reunião para discutir o planejamento do próximo sprint",
      },
      {
        date: new Date(2025, 2, 10, 15, 0).toISOString(),
        mine: false,
        title: "Reunião com a equipe",
        description: "Reunião para discutir o planejamento do próximo sprint",
      },
    ];

    this.plotSchedules();
  };

  clearSchedules = () => {
    let schedules = document.querySelectorAll(".schedule");
    schedules.forEach((schedule) => {
      schedule.innerHTML = "";
    });
  };

  plotSchedules = () => {
    this.clearSchedules();
    this.schedules.forEach((schedule) => {
      let year = new Date(schedule.date).getFullYear();
      let month = new Date(schedule.date).getMonth();
      let day = new Date(schedule.date).getDate();
      let hour = new Date(schedule.date).getHours();
      let min = zeroPad(new Date(schedule.date).getMinutes(), 2);
      let dayElement = document.querySelector(
        `[data-day='${new Date(year, month, day).toISOString()}']`
      );
      console.log("dia encontrado", dayElement);
      if (dayElement) {
        let childElement = dayElement.querySelector(".day");
        let scheduleElement = document.createElement("div");
        scheduleElement.classList.add("schedule");
        if (!schedule.mine) {
          scheduleElement.classList.add("schedule-other");
          scheduleElement.innerHTML = `<div class='icon prohibit'></div>${hour}h${min} - ${
            hour + 1
          }h${min}`;
        } else {
          scheduleElement.innerHTML = `<div class='icon ball'></div>${hour}h${min} - ${
            hour + 1
          }h${min}`;
        }
        childElement.appendChild(scheduleElement);
      }
    });
  };

  openScheduleModal = (event) => {
    document.getElementById("scheduleModal").showModal();
    if (event.target.classList.contains("day")) {
      let date = new Date(event.target.parentElement.getAttribute("data-day"));
      let inputDate = document.getElementById("inputDate");
      inputDate.value = new Date(date).toISOString().split("T")[0];
      let inputTime = document.getElementById("inputTime");
      inputTime.focus();
    }
  };

  onSchedule = (event) => {
    let date = document.getElementById("inputDate").value;
    let time = document.getElementById("inputTime").value;
    let players = document.getElementById("inputPlayers").value;
    this.schedules.push({
      date: new Date(`${date}T${time}`).toISOString(),
      mine: true,
    });
    console.log(date, time, players, event);
    this.plotSchedules();
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
