// URL base da API do Reserver
const API_BASE_URL = "http://localhost:5000";

// Função para adicionar zero à esquerda de um número
const zeroPad = (num, places) => String(num).padStart(places, "0");

// Função para configurar tooltip
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

/**
 * @description Classe para autenticação do usuário. Responsável por fazer login, logout e atualizar informações do usuário
 * @class Auth
 */
class Auth {
  constructor() {
    this.token = localStorage.getItem("token");
    this.userName = localStorage.getItem("userName");
    this.avatar = localStorage.getItem("avatar");
    this.role = localStorage.getItem("role");
    this.loginModal = document.getElementById("loginModal");
    if (!this.token) {
      this.openLoginModal();
    } else {
      this.updateUserInfo();
    }
  }

  /**
   * @description Função para fazer logout do usuário
   * @returns {void}
   * @memberof Auth
   */
  logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("avatar");
    localStorage.removeItem("role");
    this.token = null;
    this.userName = "";
    this.avatar = "";
    this.role = "";
    this.updateUserInfo();
    this.openLoginModal();
  };

  /**
   * @description Função para abrir o modal de login
   * @returns {void}
   */
  openLoginModal = () => {
    this.loginModal.showModal();
  };

  /**
   * @description Função para fechar o modal de login
   * @returns {void}
   */
  closeLoginModal = () => {
    this.loginModal.close();
  };

  /**
   * @description Função para fazer login do usuário
   * @param {Event} event Evento de clique no botão de Entrar
   * @returns {void}
   */
  login = async (event) => {
    event.preventDefault();
    document.getElementById("errorLogin").setAttribute("hidden", true);

    const email = document.getElementById("user").value;
    const password = document.getElementById("password").value;

    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");

    const formdata = new FormData();
    formdata.append("email", email);
    formdata.append("password", password);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    try {
      const result = await fetch(`${API_BASE_URL}/login`, requestOptions);
      if (result.status != 200) {
        throw new Error("Credenciais inválidas");
      }

      const data = await result.json();

      localStorage.setItem("token", data.id);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("avatar", data.avatar);
      localStorage.setItem("role", data.role);
      this.userName = data.name;
      this.avatar = data.avatar;
      this.role = data.role;
      this.updateUserInfo();
      this.closeLoginModal();
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("errorLogin").removeAttribute("hidden");
    }
  };

  /**
   * @description Função para atualizar as informações do usuário logado: avatar, nome e tipo de perfil
   * @returns {void}
   */
  updateUserInfo = () => {
    document.getElementById(
      "avatar"
    ).style.backgroundImage = `url('${this.avatar}')`;

    const userNameFields = document.querySelectorAll(".userName");
    userNameFields.forEach((field) => {
      field.innerText = this.userName;
    });
    document.getElementById("userRole").innerText = this.role;
  };
}

/**
 * @description Classe para manipulação do calendário de reservas. Responsável por exibir o calendário, listar as reservas e permitir a criação e edição de reservas.
 * @class Calendar
 * @param {Auth} auth Instância da classe Auth para utilização de informações do usuário logado nas requisições.
 */
class Calendar {
  constructor(auth) {
    this.auth = auth;
    this.schedules = [];
    this.calendarElement = document.getElementById("calendar");
    this.calendarData = [];
    this.month = new Date().getMonth();
    this.year = new Date().getFullYear();
    this.editMode = false;
    this.scheduleToEdit = null;

    // Ao iniciar a instância, construir o calendário:
    this.buildCalendarData(this.month, this.year);
  }

  /**
   * @description Função para mudar o mês do calendário. Recebe como parâmetro a direção da mudança.
   * @param {string} direction: string. Direção da mudança do mês: "next" para avançar um mês e "prev" para retroceder um mês.
   * @returns {void}
   */

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

  /**
   * @description Função para construir os dados do calendário. Recebe como parâmetros o mês e o ano a serem exibidos. Caso não sejam informados, utiliza o mês e ano atuais.
   * @param {*} month: number
   * @param {*} year: number
   * @returns {void}
   */
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

  /**
   * @description Função para construir o container de um dia do calendário. Recebe como parâmetros o dia e as classes css a serem aplicadas ao container.
   * @param {*} day: number
   * @param {*} classes: string[]
   * @returns  {HTMLElement}
   */
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

  /**
   * @description Função para construir a tabela do calendário. O método constrói a tabela e adiciona os eventos de clique nos botões de reservar. O dia atual é marcado com a classe 'today' e os dias anteriores ao dia atual são marcados com a classe 'inPast'.
   * @returns {void}
   */

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

  /**
   * @description Função para buscar as reservas do mês e ano atual. As reservas são ordenadas por data e horário e exibidas no calendário.
   * @returns {void}
   */
  getSchedules = async () => {
    let token = localStorage.getItem("token");
    if (!token) return;
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const result = await fetch(
        `${API_BASE_URL}/schedules?month=${this.month + 1}&year=${
          this.year
        }&token=${token}`,
        requestOptions
      );

      const data = await result.json();
      this.schedules = data.schedules
        .map((item) => {
          return {
            ...item,
            time: new Date(item.datetime).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        })
        .sort((a, b) => {
          let [aHour, aMin] = a.time.split(":");
          let [bHour, bMin] = b.time.split(":");
          return (
            new Date(a.date).setHours(aHour, aMin) -
            new Date(b.date).setHours(bHour, bMin)
          );
        });
      this.plotSchedules();
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("errorLogin").removeAttribute("hidden");
    }
  };

  /**
   * @description Função para limpar as reservas do calendário. Isso é feito para que as reservas sejam atualizadas sem duplicidade.
   * @returns {void}
   */
  clearSchedules = () => {
    let scheduleList = document.querySelectorAll(".schedule-list");
    scheduleList.forEach((schedule) => {
      schedule.innerHTML = "";
    });
  };

  /**
   * @description Função para plotar as reservas no calendário. As reservas são exibidas no dia correspondente, com a hora de início e fim da reserva. Caso a reserva seja de outro usuário, é exibido um ícone de proibido. Caso a reserva seja do usuário logado, é exibido um ícone de bola. Reservas no passado são marcadas com a classe 'inPast'.
   * @returns {void}
   */
  plotSchedules = () => {
    this.clearSchedules();
    this.schedules.forEach((schedule) => {
      let schedule_year = new Date(schedule.datetime).getFullYear();
      let schedule_month = new Date(schedule.datetime).getMonth();
      let schedule_day = new Date(schedule.datetime).getDate();
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
        if (!schedule.isMine) {
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

  /**
   * @description Função para abrir o modal de reserva. Caso o usuário clique no botão de reservar, o modal é aberto. Caso o usuário clique em um dia do calendário, o modal é aberto com a data do dia clicado. Caso o dia clicado seja no passado, o modal não é aberto.
   * @param {*} event
   * @param {*} element
   * @returns
   */
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

  /**
   * @description Função para fechar o modal de reserva
   * @param {*} event
   */

  closeScheduleModal = (event) => {
    document.getElementById("errorSchedule").setAttribute("hidden", true);
    document.getElementById("scheduleModal").close();
    this.editMode = false;
    this.scheduleToEdit = null;
  };

  /**
   * @description Função para salvar a reserva. A função é responsável por enviar a requisição para a API com os dados da reserva. Caso a reserva já exista, o método PATCH é utilizado. Caso a reserva seja nova, o método POST é utilizado.
   * @param {*} event
   * @returns {void}
   */

  onSchedule = async (event) => {
    event.preventDefault();
    document.getElementById("errorSchedule").setAttribute("hidden", true);
    let token = localStorage.getItem("token");
    if (!token) return;
    let date = document.getElementById("inputDate").value;
    let time = document.getElementById("inputTime").value;
    let datetime = new Date(`${date}T${time}`).toISOString();
    let players = document.getElementById("inputPlayers").value;

    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");

    const formdata = new FormData();
    formdata.append("datetime", datetime);
    formdata.append("players", players);
    formdata.append("token", token);
    if (this.editMode) {
      formdata.append("id", this.scheduleToEdit.id);
    }

    const requestOptions = {
      method: this.editMode ? "PATCH" : "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    try {
      const result = await fetch(`${API_BASE_URL}/schedule`, requestOptions);
      if (result.status != 200) {
        throw new Error("Invalid credentials");
      }
      this.getSchedules();
      this.closeScheduleModal();
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("errorSchedule").removeAttribute("hidden");
    }
  };

  /**
   * @description Função para abrir o modal de edição de reserva. A função é responsável por abrir o modal de reserva com os dados da reserva a ser editada. Caso a reserva não seja do usuário logado, o modal não é aberto.
   * @param {*} schedule
   * @returns
   */

  openModalToeditSchedule(schedule) {
    if (!schedule.isMine) return;
    this.scheduleToEdit = schedule;
    this.editMode = true;
    document.getElementById("scheduleModal").showModal();
    let inputDate = document.getElementById("inputDate");
    inputDate.value = new Date(schedule.datetime)
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

// Instâncias das classes Auth e Calendar
let calendar = null;
let auth = null;

// Função para montar a aplicação
const mounted = () => {
  window.onload = () => {
    auth = new Auth();
    calendar = new Calendar(auth);
  };
};

mounted();
