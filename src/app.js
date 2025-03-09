document.getElementById("avatar").style.backgroundImage =
  "url('https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";

const zeroPad = (num, places) => String(num).padStart(places, "0");

const setTooltip = () => {
  const tooltip = document.getElementById("tooltip");
  const items = document.querySelectorAll(".schedule");

  items.forEach((item) => {
    item.addEventListener("mouseenter", (e) => {
      const text = item.getAttribute("data-tooltip");
      tooltip.textContent = text;
      tooltip.style.opacity = "1";

      const rect = item.getBoundingClientRect();
      tooltip.style.position = "fixed";
      tooltip.style.top = `${rect.top - 40}px`;
      tooltip.style.left = `calc(${rect.left}px + ${rect.width / 2}px)`;
    });

    item.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });
  });
};

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
  constructor(auth) {
    this.auth = auth;
    this.schedules = [];
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

  buildDayContainer = (day, classes) => {
    const div = document.createElement("div");
    div.classList.add("day");
    classes.forEach((className) => {
      div.classList.add(className);
    });
    div.innerHTML = `
    <div class="day-head"> 
    <div>${day}</div>
    <button class="btn small">Reservar</button>
    </div>
    <div class="schedule-list"></div>
    `;
    return div;
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
            td.appendChild(this.buildDayContainer(day, ["today"]));
          } else if (
            new Date(this.year, this.month, day).valueOf() <
            new Date().valueOf()
          ) {
            td.appendChild(this.buildDayContainer(day, ["inPast"]));
          } else {
            td.appendChild(this.buildDayContainer(day, []));
          }
          let button = td.querySelector("button");
          button.addEventListener("click", (event) => {
            this.openScheduleModal(event, td);
          });
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
    this.getSchedules();
  };

  getSchedules = () => {
    this.schedules = [
      {
        date: new Date().toISOString(),
        time: "15:00",
        mine: false,
        players: 2,
      },
      {
        date: new Date(2025, 2, 10, 15, 0).toISOString(),
        time: "17:00",
        mine: true,
        players: 2,
      },
      {
        date: new Date(2025, 2, 13, 15, 0).toISOString(),
        time: "17:00",
        mine: true,
        players: 2,
      },
    ].sort((a, b) => {
      let [aHour, aMin] = a.time.split(":");
      let [bHour, bMin] = b.time.split(":");
      return (
        new Date(a.date).setHours(aHour, aMin) -
        new Date(b.date).setHours(bHour, bMin)
      );
    });
    this.plotSchedules();
  };

  clearSchedules = () => {
    let scheduleList = document.querySelectorAll(".schedule-list");
    scheduleList.forEach((schedule) => {
      schedule.innerHTML = "";
    });
  };

  plotSchedules = () => {
    this.clearSchedules();
    this.schedules.forEach((schedule) => {
      let schedule_year = new Date(schedule.date).getFullYear();
      let schedule_month = new Date(schedule.date).getMonth();
      let schedule_day = new Date(schedule.date).getDate();
      let hour = +schedule.time.split(":")[0];
      let min = zeroPad(schedule.time.split(":")[1], 2);
      let dayElement = document.querySelector(
        `[data-day='${new Date(
          schedule_year,
          schedule_month,
          schedule_day
        ).toISOString()}']`
      );
      if (dayElement) {
        const scheduleElement = document.createElement("div");
        scheduleElement.setAttribute("data-tooltip", "Editar");
        scheduleElement.classList.add("schedule");
        if (!schedule.mine) {
          scheduleElement.classList.add("schedule-other");
          scheduleElement.innerHTML = `<div class='icon prohibit'></div>${hour}h${min} - ${
            hour + 1
          }h${min}`;
        } else if (
          new Date(
            schedule_year,
            schedule_month,
            schedule_day,
            hour,
            min
          ).valueOf() < new Date().valueOf()
        ) {
          scheduleElement.classList.add("inPast");
          scheduleElement.innerHTML = `<div class='icon ball'></div>${hour}h${min} - ${
            hour + 1
          }h${min}`;
        } else {
          scheduleElement.innerHTML = `<div class='icon ball'></div>${hour}h${min} - ${
            hour + 1
          }h${min}`;
        }

        scheduleElement.addEventListener("click", () => {
          this.openModalToeditSchedule(schedule);
        });

        let scheduleList = dayElement.querySelector(".schedule-list");
        scheduleList.appendChild(scheduleElement);
      }
    });
    setTooltip();
  };

  openScheduleModal = (event, element) => {
    if (event && event.target.classList.contains("schedule")) return;
    if (element && element.childNodes[0].classList.contains("inPast")) return;
    document.getElementById("scheduleModal").showModal();
    document.getElementById("saveSchedule").innerText = "Reservar";
    document.querySelector(".dialog-content>h3").innerText = "Reservar quadra";
    let inputDate = document.getElementById("inputDate");
    inputDate.min = new Date().toISOString().split("T")[0];
    let inputTime = document.getElementById("inputTime");
    if (element && element.getAttribute("data-day")) {
      let date = new Date(element.getAttribute("data-day"));
      inputDate.value = new Date(date).toISOString().split("T")[0];
      inputTime.focus();
    }
  };

  closeScheduleModal = (event) => {
    document.getElementById("scheduleModal").close();
  };

  onSchedule = (event) => {
    let date = document.getElementById("inputDate").value;
    let time = document.getElementById("inputTime").value;
    let players = document.getElementById("inputPlayers").value;
    this.schedules.push({
      date: new Date(`${date}T${time}`).toISOString(),
      time: time,
      mine: true,
      players: players,
      user: this.auth.token,
    });
    this.plotSchedules();
  };

  openModalToeditSchedule(schedule) {
    if (!schedule.mine) return;
    document.getElementById("scheduleModal").showModal();
    let inputDate = document.getElementById("inputDate");
    inputDate.value = new Date(schedule.date)
      .toLocaleDateString("pt-BR")
      .split("/")
      .reverse()
      .join("-");
    let inputTime = document.getElementById("inputTime");
    inputTime.value = schedule.time;
    let inputPlayers = document.getElementById("inputPlayers");
    inputPlayers.value = schedule.players;
    document.getElementById("saveSchedule").innerText = "Salvar";
    document.querySelector(".dialog-content>h3").innerText = "Editar reserva";
  }
}

let calendar = null;
let auth = null;

const mounted = () => {
  window.onload = () => {
    auth = new Auth();
    calendar = new Calendar(auth);
  };
};

mounted();
