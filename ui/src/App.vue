<template>
  <v-app id="inspire">
    <!--Navigation-->
    <v-navigation-drawer v-model="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app>
      <v-list dense>
        <template v-for="item in items">
          <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="6">
              <v-subheader v-if="item.heading">{{ item.heading }}</v-subheader>
            </v-col>
          </v-row>
          <v-list-group
            v-else-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item-content>
            </template>
          </v-list-group>
          <v-list-item v-else :key="item.text" link>
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!--Top bar-->
    <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <span class="hidden-sm-and-down">OpenProject Dasboard</span>
      </v-toolbar-title>
      <v-spacer />
      {{time}} | {{date}}
    </v-app-bar>

    <!--window or windows in the middle-->
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <!--first window-->
          <v-col cols="12" sm="16" md="12" v-if="!extendedDisplay">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>{{window}}</v-toolbar-title>
                <v-spacer />
                <v-switch v-model="extendedDisplay" label="Erweiterte Anzeige"></v-switch>
              </v-toolbar>
              <v-card-text>
                <div v-if="window == 'Projekte'">
                  <!--Projects-->
                  <v-slider step="1" :min="0"></v-slider>
                  <v-simple-table style="width: 100%">
                    <thead>
                      <tr>
                        <th>Projekttitel</th>
                        <th>Teilnehmer</th>
                        <th>Status</th>
                        <th>Fortschritt</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <!--Project title-->
                        </td>
                        <td>
                          <!--Project members-->
                          <ul>
                            <li></li>
                          </ul>
                        </td>
                        <td>
                          <!--Project status-->
                        </td>
                        <td>
                          <!--Project progress-->
                          <v-progress-circular></v-progress-circular>
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </div>
                <div v-if="window == 'Studenten'">
                  <!--Students-->
                  <center>
                    <v-btn v-on:click="getDBStudents(4)">ICT</v-btn>
                    <v-btn v-on:click="getDBStudents(3)">1.LJ</v-btn>
                    <v-btn v-on:click="getDBStudents(2)">2.LJ</v-btn>
                    <v-btn v-on:click="getDBStudents(1)">3.LJ</v-btn>
                  </center>
                  <br />
                  <div v-if="this.class!=null">
                    <v-simple-table dense height="500px" fixed-header>
                      <thead>
                        <tr>
                          <th width="50px"></th>
                          <th width="10%">Vorname</th>
                          <th width="90%">Nachname</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(student, i) in this.studentsStorage" :key="i">
                          <td>
                            <v-btn v-on:click="deleteDBStudents(student)">X</v-btn>
                          </td>
                          <td>{{ student.prename }}</td>
                          <td>{{ student.surname }}</td>
                        </tr>
                      </tbody>
                    </v-simple-table>
                    <v-row justify="center">
                      <v-col class="d-flex" cols="12" sm="2">
                        <v-text-field v-model="studentAdd.prename" label="Vorname"></v-text-field>
                      </v-col>
                      <v-col class="d-flex" cols="12" sm="2">
                        <v-text-field v-model="studentAdd.surname" label="Nachname"></v-text-field>
                      </v-col>
                      <v-col class="d-flex" cols="12" sm="2">
                        <v-btn dense v-on:click="postDBStudents()">Hinzufügen</v-btn>
                      </v-col>
                    </v-row>
                  </div>
                </div>
                <div v-if="window == 'Stundenpläne'">
                  <!--Timetable-->
                  <center>
                    <v-btn v-on:click="getDBTimeTable(4)">ICT</v-btn>
                    <v-btn v-on:click="getDBTimeTable(3)">1.LJ</v-btn>
                    <v-btn v-on:click="getDBTimeTable(2)">2.LJ</v-btn>
                    <v-btn v-on:click="getDBTimeTable(1)">3.LJ</v-btn>
                  </center>
                  <v-calendar
                    v-on:click:event="deleteDBTimeTable($event)"
                    height="200"
                    :first-interval="7"
                    :interval-minutes="60"
                    :interval-count="11"
                    ref="calendar"
                    :value="dateCode"
                    :events="timeTableStorage"
                    color="primary"
                    type="week"
                    dense
                    :key="componentKey"
                  />
                  <center v-if="this.class!= null">
                    Bitte beachten Sie, dass das Klicken eines Stundenplaneintrags zur Löschung des Stundenplaneintrags führt!
                    <v-row justify="center">
                      <v-col class="d-flex" cols="12" sm="2">
                        <v-select dense label="Tag" v-model="timeTableAdd.day" :items="dayList"></v-select>
                      </v-col>
                      <v-col class="d-flex" cols="12" sm="2">
                        <v-text-field
                          dense
                          label="Startzeit"
                          v-model="timeTableAdd.start"
                          placeholder="07:40:00"
                        ></v-text-field>
                      </v-col>
                      <v-col class="d-flex" cols="12" sm="2">
                        <v-text-field
                          dense
                          label="Endzeit"
                          v-model="timeTableAdd.end"
                          placeholder=" 11:50:00"
                        ></v-text-field>
                      </v-col>
                      <v-col class="d-flex" cols="12" sm="2">
                        <v-select
                          dense
                          label="Fach"
                          v-model="timeTableAdd.subject"
                          :items="this.subjectsStorage"
                        ></v-select>
                      </v-col>
                      <v-col class="d-flex" cols="12" sm="2">
                        <v-btn dense v-on:click="postDBTimeTable()">Hinzufügen</v-btn>
                      </v-col>
                    </v-row>
                  </center>
                </div>
                <div v-if="window == 'Einstellungen'">
                  <!--Settings-->
                  <center>
                    <v-btn v-on:click="window='Studenten'">Klassenliste bearbeiten</v-btn>
                    <v-btn v-on:click="window='Stundenpläne'">Stundenplan bearbeiten</v-btn>
                  </center>
                </div>
                <div v-if="window == 'Login'">
                  <!--Login-->
                  <center>
                    <v-text-field></v-text-field>
                    <v-text-field></v-text-field>
                    <v-btn>Login</v-btn>
                  </center>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!--identical window-->
          <v-col cols="12" sm="16" md="6" v-if="extendedDisplay">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>{{window}}</v-toolbar-title>
                <v-spacer />
                <v-switch v-model="extendedDisplay" label="Erweiterte Anzeige"></v-switch>
              </v-toolbar>
              <v-card-text>
                <div v-if="window == 'Projekte'">
                  <!--Projects-->
                  <v-slider step="1" :min="0"></v-slider>
                  <v-simple-table style="width: 100%">
                    <thead>
                      <tr>
                        <th>Projekttitel</th>
                        <th>Teilnehmer</th>
                        <th>Status</th>
                        <th>Fortschritt</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <!--Project title-->
                        </td>
                        <td>
                          <!--Project members-->
                          <ul>
                            <li></li>
                          </ul>
                        </td>
                        <td>
                          <!--Project status-->
                        </td>
                        <td>
                          <!--Project progress-->
                          <v-progress-circular></v-progress-circular>
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </div>
                <div v-if="window == 'Studenten'">
                  <!--Students-->
                  <center>
                    <v-btn>ICT</v-btn>
                    <v-btn>1.LJ</v-btn>
                    <v-btn>2.LJ</v-btn>
                    <v-btn>3.LJ</v-btn>
                  </center>
                  <v-list>
                    <v-list-item-group>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title></v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </div>
                <div v-if="window == 'Stundenpläne'">
                  <!--Timetable-->
                  <v-sheet>
                    <v-calendar></v-calendar>
                  </v-sheet>
                  <center>
                    Bitte beachten Sie, dass das Klicken eines Stundenplaneintrags zur Löschung des Stundenplaneintrags führt!
                    <v-btn>ICT</v-btn>
                    <v-btn>1.LJ</v-btn>
                    <v-btn>2.LJ</v-btn>
                    <v-btn>3.LJ</v-btn>
                    <v-row>
                      <v-text-field></v-text-field>
                      <v-text-field></v-text-field>
                      <v-select></v-select>
                      <v-btn></v-btn>
                    </v-row>
                  </center>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <!--additional window-->
          <v-col cols="12" sm="16" md="6" v-if="extendedDisplay">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Erweiterte Anzeige</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <!-- Write additional information here -->
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>




<script>
import axios from "axios";
export default {
  name: "App",
  data() {
    return {
      dialog: false,
      drawer: false,
      items: [
        { icon: "mdi-school", text: "LOA 903" },
        { icon: "mdi-school", text: "LOA 002" },
        { icon: "mdi-school", text: "LOH" },
        { icon: "mdi-settings", text: "Einstellungen" }
      ],

      timeTableAdd: {
        day: null,
        start: null,
        end: null,
        subject: null
      },

      studentAdd: {
        surname: null,
        prename: null
      },

      //Storages
      subjectsStorage: [],
      timeTableStorage: [],
      studentsStorage: [],
      projectsStorage: [],
      displayStorage: [],

      //OpenProject Login
      ip: "172.30.254.79",
      username: "",
      password: "",

      //Days
      dayList: [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag"
      ],

      //Interface data
      window: "Studenten",
      class: null,
      extendedDisplay: false,
      date: "",
      dateCode: "",
      time: "",

      //componentKey forces Vue to update the DOM of the tagged element
      componentKey: 0,

      //Intervals
      timeIntervalID: 0,
      dateIntervalID: 0
    };
  },
  async created() {
    await this.createTime();
    await this.createDate();
    await this.getDBSubjects();
  },
  methods: {
    //Fill the time variable with the current time
    createTime() {
      clearInterval(this.timeIntervalID);
      const tempNow = new Date();
      var tempHour, tempMinute;
      if (tempNow.getHours() < 10) {
        tempHour = "0" + tempNow.getHours();
      } else {
        tempHour = tempNow.getHours();
      }
      if (tempNow.getMinutes() < 10) {
        tempMinute = "0" + tempNow.getMinutes();
      } else {
        tempMinute = tempNow.getMinutes();
      }
      this.time = tempHour + ":" + tempMinute; //Display time
      this.timeIntervalID = setInterval(
        function() {
          this.createTime();
        }.bind(this),
        100
      );
    },
    //Fill the date variable with the current date
    createDate() {
      clearInterval(this.dateIntervalID);
      const tempToday = new Date();
      var tempDay, tempMonth;
      if (tempToday.getMonth() < 10) {
        tempMonth = "0" + (tempToday.getMonth() + 1);
      } else {
        tempMonth = tempToday.getMonth() + 1;
      }
      if (tempToday.getDate() < 10) {
        tempDay = "0" + (tempToday.getDay() + 1);
      }

      this.date = tempDay + "." + tempMonth + "." + tempToday.getFullYear(); //Display date
      this.dateCode = tempToday.getFullYear() + "-" + tempMonth + "-" + tempDay; //code date
      this.timeIntervalID = setInterval(
        function() {
          this.createTime();
        }.bind(this),
        100000
      );
    },
    //Gets subjects from MySQL DB
    async getDBSubjects() {
      var tempSubjectList = [];
      let tempSubject = await axios.get(`/api/subjects`);
      for (var i = 0; i < tempSubject.data.length; i++) {
        tempSubjectList.push(tempSubject.data[i].subject);
      }
      this.subjectsStorage = tempSubjectList;
    },
    //Gets timetable from MySQL DB
    async getDBTimeTable(tempClass) {
      let tempTimeTableStorage = await axios.get(
        `/api/timetables/${tempClass}`
      );
      this.timeTableStorage = tempTimeTableStorage.data;
      this.class = tempClass;
      await this.adjustTimeTableStorage();
    },
    //This makes the Data from the Databank readable for the Vue-Calendar
    adjustTimeTableStorage() {
      var tempAdjustedTimeTable = [],
        tempEntry;
      for (var i = 0; i < this.timeTableStorage.length; i++) {
        var tempName, tempStart, tempEnd;
        var tempOtherDay = this.calculateOtherDate(i);
        tempName = this.timeTableStorage[i].subject;
        tempStart =
          tempOtherDay +
          " " +
          this.timeTableStorage[i].start.toString().slice(0, -3);
        tempEnd =
          tempOtherDay +
          " " +
          this.timeTableStorage[i].end.toString().slice(0, -3);

        tempEntry = {
          name: tempName,
          start: tempStart,
          end: tempEnd,
          class: this.class,
          id: this.timeTableStorage[i].idtimetable
        };
        tempAdjustedTimeTable.push(tempEntry);
      }
      this.timeTableStorage = tempAdjustedTimeTable;
      this.componentKey += 1;
    },
    calculateOtherDate(i) {
      var tempCurrentDay = new Date();
      var tempDayDifference =
        this.timeTableStorage[i].day - tempCurrentDay.getDay();
      tempCurrentDay.setDate(tempCurrentDay.getDate() + tempDayDifference);
      var tempDay, tempMonth;
      if (tempCurrentDay.getMonth() < 10) {
        tempMonth = "0" + (tempCurrentDay.getMonth() + 1);
      } else {
        tempMonth = tempCurrentDay.getMonth() + 1;
      }
      if (tempCurrentDay.getDate() < 10) {
        tempDay = "0" + (tempCurrentDay.getDay() + 1);
      }
      var tempOtherDay =
        tempCurrentDay.getFullYear() + "-" + tempMonth + "-" + tempDay;
      return tempOtherDay;
    },
    //Removes one entry of the timetable
    async deleteDBTimeTable(tempTimeTableEntry) {
      var tempEvent = tempTimeTableEntry;
      await axios.delete(`/api/timetables/${tempEvent.event.id}`);
      await this.getDBTimeTable(this.class);
    },
    //Posts an entry into the timetable
    async postDBTimeTable() {
      if (
        this.timeTableAdd.day != null &&
        this.timeTableAdd.start != null &&
        this.timeTableAdd.end != null &&
        this.timeTableAdd.subject != null
      ) {
        let tempPostTimeTable = await this.adjustPostTimeTable();
        await axios.post("/api/timetables", tempPostTimeTable);
        await this.getDBTimeTable(this.class);
      }
    },
    adjustPostTimeTable() {
      let tempPostTimeTable = {
        day: null,
        start: this.timeTableAdd.start,
        end: this.timeTableAdd.end,
        classes_id: this.class,
        subjects_id: null
      };
      for (var i = 0; i < this.dayList.length; i++) {
        if (this.dayList[i] == this.timeTableAdd.day) {
          tempPostTimeTable.day = i;
        }
      }
      for (var j = 0; j < this.subjectsStorage.length; j++) {
        if (this.subjectsStorage[j] == this.timeTableAdd.subject) {
          tempPostTimeTable.subjects_id = j + 1;
        }
      }
      this.timeTableAdd = {
        day: null,
        start: null,
        end: null,
        subject: null
      };
      return tempPostTimeTable;
    },
    //Gets students from MySQL DB
    async getDBStudents(tempClass) {
      let tempStudentsStorage = await axios.get(`/api/students/${tempClass}`);
      this.studentsStorage = tempStudentsStorage.data;
      this.class = tempClass;
    },
    //Removes one student from the classlist
    async deleteDBStudents(tempStudent) {
      await axios.delete(`/api/students/${tempStudent.idstudents}`);
      await this.getDBStudents(this.class);
    },
    //Add a new student to the classlist
    async postDBStudents() {
      if (this.studentAdd.surname != null && this.studentAdd.prename != null) {
        let tempPostStudents = {
          surname: this.studentAdd.surname,
          prename: this.studentAdd.prename,
          classes_id: this.class
        };
        await axios.post("/api/students", tempPostStudents);
        await this.getDBStudents(this.class);
      }
    },
    //Gets projects from OpenProject API
    getOPProjects() {},
    //Creates the display from the project storage
    createDisplay() {}
  },
  beforeDestroy() {
    clearInterval(this.dataUpdaterIntervalID);
    clearInterval(this.timeUpdaterIntervalID);
  }
};
</script>
