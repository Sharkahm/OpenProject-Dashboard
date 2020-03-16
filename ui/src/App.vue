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
          <v-list-item v-else :key="item.text" link v-on:click="clickChangeWindow(item.text)">
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
    <v-content v-if="window!=null">
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
                  <v-row style="height: 32px; padding: 0; margin: 0">
                    <v-checkbox v-model="checkboxProjectName" label="Projektname" dense />
                    <v-checkbox v-model="checkboxProjectMembers" label="Projektmitglieder" dense />
                    <v-checkbox v-model="checkboxProjectStatus" label="Projektstatus" dense />
                    <v-checkbox v-model="checkboxProjectProgress" label="Projektfortschritt" dense />
                  </v-row>
                  <v-slider
                    v-model="displayNumber"
                    step="1"
                    ticks="always"
                    :min="0"
                    :max="maxDisplayNumber"
                    @change="createDisplay()"
                  ></v-slider>
                  <v-simple-table style="width: 100%" v-if="this.displayStorage.length != 0">
                    <thead>
                      <tr>
                        <th v-if="checkboxProjectName" style="font-size: 20px;">Projekttitel</th>
                        <th
                          v-if="checkboxProjectMembers"
                          style="font-size: 20px; width: 100px"
                        >Teilnehmer</th>
                        <th v-if="checkboxProjectStatus" style="font-size: 20px; width: 20px">Status</th>
                        <th
                          v-if="checkboxProjectProgress"
                          style="font-size: 20px; width: 20px"
                        >Fortschritt</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(displayer, i) in displayStorage" :key="i">
                        <td style="font-size: 35px" v-if="checkboxProjectName">
                          <!--Project title-->
                          {{ displayer.project }}
                        </td>
                        <td style="font-size: 20px;" v-if="checkboxProjectMembers">
                          <!--Project members-->
                          <ul>
                            <li v-for="(member, j) in displayer.members" v-text="member" :key="j"></li>
                          </ul>
                        </td>
                        <td
                          v-if="checkboxProjectStatus"
                          style="font-size: 20px;"
                          v-bind:class="{ greenBC: displayer.status=='on track', yellowBC: displayer.status=='at risk', redBC: displayer.status=='off track', whiteBC: displayer.status==null}"
                        >{{ displayer.status }}</td>
                        <td v-if="checkboxProjectProgress">
                          <!--Project progress-->
                          <v-progress-circular
                            color="primary"
                            size="80"
                            width="16"
                            :rotate="-90"
                            :value="displayer.progress"
                          ></v-progress-circular>
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
                    <v-text-field label="Benutzer" v-model="loginUsername"></v-text-field>
                    <v-text-field label="Passwort" v-model="loginPassword" :type="'password'"></v-text-field>
                    <v-btn v-on:click="clickLogin()">Login</v-btn>
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
                  <v-row style="height: 32px; padding: 0; margin: 0">
                    <v-checkbox v-model="checkboxProjectName" label="Projektname" dense />
                    <v-checkbox v-model="checkboxProjectMembers" label="Projektmitglieder" dense />
                    <v-checkbox v-model="checkboxProjectStatus" label="Projektstatus" dense />
                    <v-checkbox v-model="checkboxProjectProgress" label="Projektfortschritt" dense />
                  </v-row>
                  <!--Projects-->
                  <v-slider
                    v-model="displayNumber"
                    step="1"
                    ticks="always"
                    :min="0"
                    :max="maxDisplayNumber"
                    @change="createDisplay()"
                  ></v-slider>
                  <v-simple-table style="width: 100%" v-if="this.displayStorage.length != 0">
                    <thead>
                      <tr>
                        <th v-if="checkboxProjectName" style="font-size: 15px;">Projekttitel</th>
                        <th
                          v-if="checkboxProjectMembers"
                          style="font-size: 15px; width: 50px"
                        >Teilnehmer</th>
                        <th v-if="checkboxProjectStatus" style="font-size: 15px; width: 10px">Status</th>
                        <th
                          v-if="checkboxProjectProgress"
                          style="font-size: 15px; width: 10px"
                        >Fortschritt</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(displayer, i) in displayStorage" :key="i">
                        <td style="font-size: 25px" v-if="checkboxProjectName">
                          <!--Project title-->
                          {{ displayer.project }}
                        </td>
                        <td style="font-size: 15px;" v-if="checkboxProjectMembers">
                          <!--Project members-->
                          <ul>
                            <li v-for="(member, j) in displayer.members" v-text="member" :key="j"></li>
                          </ul>
                        </td>
                        <td
                          v-if="checkboxProjectStatus"
                          style="font-size: 15px;"
                          v-bind:class="{ greenBC: displayer.status=='on track', yellowBC: displayer.status=='at risk', redBC: displayer.status=='off track', whiteBC: displayer.status==null}"
                        >{{ displayer.status }}</td>
                        <td>
                          <!--Project progress-->
                          <v-progress-circular
                            v-if="checkboxProjectProgress"
                            color="primary"
                            size="40"
                            width="8"
                            :rotate="-90"
                            :value="displayer.progress"
                          ></v-progress-circular>
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
                    <v-text-field label="Benutzer" v-model="loginUsername"></v-text-field>
                    <v-text-field label="Passwort" v-model="loginPassword" :type="'password'"></v-text-field>
                    <v-btn v-on:click="logTeacherIn()">Login</v-btn>
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
      //Interface data
      dialog: false,
      drawer: false,
      items: [
        { icon: "mdi-school", text: "LOA 903" },
        { icon: "mdi-school", text: "LOA 002" },
        { icon: "mdi-school", text: "LOH" },
        { icon: "mdi-settings", text: "Einstellungen" }
      ],
      rotation: [],
      displayNumber: 0,
      maxDisplayNumber: 1,
      loginUsername: "",
      loginPassword: "",
      window: null,
      class: null,
      extendedDisplay: false,
      date: "",
      dateCode: "",
      time: "",
      room: null,
      checkboxProjectName: true,
      checkboxProjectMembers: true,
      checkboxProjectStatus: true,
      checkboxProjectProgress: true,

      //Objects to add new entries
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
      ip: "192.168.60.55",
      username: "apikey",
      password:
        "c924b153e11ec721010f5d3a81a6cb304ff5d25ed0820a753539298b772aa803",

      //Raw Data from OpenProject
      projects: [],
      memberships: [],
      progress: [],

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

      //componentKey forces Vue to update the DOM of the tagged element
      componentKey: 0,

      //Intervals
      timeIntervalID: 0,
      dateIntervalID: 0,
      rotationIntervalID: 0,
      loadProjectsIntervalID: 0
    };
  },
  //everything here gets executed as soon as the application starts
  async created() {
    await this.createTime(); //Create time data
    await this.createDate(); //Create date data
    await this.getDBSubjects(); //Create subject list data
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
        tempDay = "0" + tempToday.getDay();
      } else {
        tempDay = tempToday.getDate();
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

    //changes window on click and empties Storages etc. on change.
    clickChangeWindow(selection) {
      this.displayStorage = [];
      this.projectsStorage = [];
      this.studentsStorage = [];
      this.class = null;
      this.displayNumber = 0;
      switch (selection) {
        case "LOA 903":
        case "LOA 002":
        case "LOH":
          this.window = "Projekte";
          this.createProjectsWindow(selection);
          break;
        case "Einstellungen":
          this.window = "Login";
          break;
      }
    },

    //Defining room by asigning a number
    async createProjectsWindow(selection) {
      if (this.window == "Projekte") {
        switch (selection) {
          case "LOA 903":
            this.room = 1;
            break;
          case "LOA 002":
            this.room = 2;
            break;
          case "LOH":
            this.room = 3;
            break;
        }
        await this.getDBTimeTableDay();
        await this.createProjects();
      }
    },

    //gets the time tables of the day
    async getDBTimeTableDay() {
      var tempDay = new Date();
      let tempTimeTableDayGetter = await axios.get(
        `/api/timetables/day/${tempDay.getDay()}`
      );
      tempTimeTableDayGetter = tempTimeTableDayGetter.data;
      this.adjustDBTimeTableDay(tempTimeTableDayGetter);
    },

    //filters and adjusts the timetable of the day on workshop lessons and room
    adjustDBTimeTableDay(tempTimeTableDayGetter) {
      let tempTimeTableDay = [];
      for (var i = 0; i < tempTimeTableDayGetter.length; i++) {
        if (
          tempTimeTableDayGetter[i].subject == "Praktischer Unterricht" &&
          tempTimeTableDayGetter[i].rooms_id == this.room
        ) {
          tempTimeTableDay.push({
            start: tempTimeTableDayGetter[i].start,
            end: tempTimeTableDayGetter[i].end,
            class: tempTimeTableDayGetter[i].classes_id,
            room: tempTimeTableDayGetter[i].rooms_id
          });
        }
      }
      this.compareDBTimeTableDay(tempTimeTableDay);
    },

    //Defines a class when the class has workshop lessons -> Time based
    compareDBTimeTableDay(tempTimeTableDay) {
      let currentHour = this.time.slice(0, 2);
      for (var i = 0; i < tempTimeTableDay.length; i++) {
        let tempStartWorkshopHour = tempTimeTableDay[i].start.slice(0, 2);
        let tempEndWorkshopHour = tempTimeTableDay[i].end.slice(0, 2);
        if (
          parseInt(tempStartWorkshopHour) <= parseInt(currentHour) &&
          parseInt(currentHour) <= parseInt(tempEndWorkshopHour)
        ) {
          this.class = tempTimeTableDay[0].class;
        } else {
          this.class = null;
        }
      }
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

    //Calculate the date
    calculateOtherDate(i) {
      var tempCurrentDay = new Date();
      var tempDayDifference =
        this.timeTableStorage[i].day - tempCurrentDay.getDay();
      tempCurrentDay.setDate(tempCurrentDay.getDate() + tempDayDifference);
      var tempDay, tempMonth;
      //in case the monthnumber is lower than 10, months like march are defined as 04 instead of 4. Adjusting to the fact that getMonth() starts with 0.
      if (tempCurrentDay.getMonth() < 10) {
        tempMonth = "0" + (tempCurrentDay.getMonth() + 1);
      } else {
        tempMonth = tempCurrentDay.getMonth() + 1;
      }
      //in case the date is lower than 10, days like the 4th are defined as 04 instead of 4
      if (tempCurrentDay.getDate() < 10) {
        tempDay = "0" + tempCurrentDay.getDate();
      } else {
        tempDay = tempCurrentDay.getDate();
      }
      //construct date
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

    //Creates an object and adjust the given data before sending it to the DB
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

    //--------------------------------------------------
    //Order to get the projects to the display
    async createProjects() {
      if (this.class != null) {
        await this.getOPProjects();
        await this.getOPMemberships();
        await this.adjustOPProjectProgress();
        await this.adjustOPMemberships();
        await this.adjustOPProjects();
        await this.createDisplay();
      } else {
        alert("Zurzeit hat es im Raum kein Werkstattunterricht!");
      }
    },

    //Gets projects from OpenProject API
    async getOPProjects() {
      let tempGetOPProjects = await axios.get(
        `http://${this.ip}/openproject/api/v3/projects/`,
        {
          auth: {
            username: this.username,
            password: this.password
          }
        }
      );
      this.projects = tempGetOPProjects.data._embedded.elements;
    },

    //Gets memberships from OpenProject API
    async getOPMemberships() {
      let tempGetOPMemberships = await axios.get(
        `http://${this.ip}/openproject/api/v3/memberships`,
        {
          auth: {
            username: this.username,
            password: this.password
          }
        }
      );
      this.memberships = tempGetOPMemberships.data._embedded.elements;
    },

    //Gets the progress of the project by ID (i)
    async getOPProjectProgress(i) {
      let tempgetOPProjectProgress = await axios.get(
        `http://${this.ip}/openproject/api/v3/projects/${i}/queries/default?filters=[{"status":{"operator":"*","values":[]}}]`,
        {
          auth: {
            username: this.username,
            password: this.password
          }
        }
      );
      return tempgetOPProjectProgress.data._embedded;
    },

    //adjusting Projects import from OpenProject for the projects storage
    adjustOPProjects() {
      var tempProjectsStorage = [];
      for (var i = 0; i < this.projects.length; i++) {
        var tempProjectObject = {
          project: this.projects[i].name,
          status: this.projects[i].status,
          members: [],
          progress: 0
        };
        for (var j = 0; j < this.memberships.length; j++) {
          if (this.memberships[j].project == tempProjectObject.project) {
            tempProjectObject.members.push(this.memberships[j].member);
          }
        }
        for (var k = 0; k < this.progress.length; k++) {
          if (this.progress[k].project == tempProjectObject.project) {
            tempProjectObject.progress = this.progress[k].progress;
          }
        }
        tempProjectsStorage.push(tempProjectObject);
      }
      this.projectsStorage = tempProjectsStorage;
    },

    //adjusting Memberships import from OpenProject for the project storage
    adjustOPMemberships() {
      var tempMemberships = [];
      for (var i = 0; i < this.memberships.length; i++) {
        var tempMembershipsObject = {
          member: this.memberships[i]._links.self.title,
          project: this.memberships[i]._links.project.title
        };
        tempMemberships.push(tempMembershipsObject);
      }
      this.memberships = tempMemberships;
    },

    //adjusting project progress import from OpenProject for the project storage
    async adjustOPProjectProgress() {
      var tempProgress = [];
      for (var i = 1; i <= this.projects.length; i++) {
        let tempProgressObjectGetter = await this.getOPProjectProgress(i);
        var tempProgressSum = 0;
        if (
          tempProgressObjectGetter.results.total >
          tempProgressObjectGetter.results.count
        ) {
          let tempDifference =
            tempProgressObjectGetter.results.total -
            tempProgressObjectGetter.results.count;
          tempProgressSum += tempDifference * 100;
        }
        for (var j = 0; j < tempProgressObjectGetter.results.count; j++) {
          tempProgressSum +=
            tempProgressObjectGetter.results._embedded.elements[j]
              .percentageDone;
        }
        tempProgressSum =
          tempProgressSum / tempProgressObjectGetter.results.total;
        if (isNaN(tempProgressSum)) {
          tempProgressSum = 0;
        }
        let tempProgressObject = {
          project: tempProgressObjectGetter.project.name,
          progress: tempProgressSum
        };
        tempProgress.push(tempProgressObject);
      }
      this.progress = tempProgress;
    },

    //Creates the display from the project storage
    async createDisplay() {
      clearInterval(this.rotationIntervalID);
      if (this.class != null) {
        await this.getDBStudents(this.class);
        var tempProjectsInClass = [];
        for (var i = 0; i < this.projectsStorage.length; i++) {
          var tempKeep = await this.compareMembersToClass(
            this.projectsStorage[i]
          );
          if (tempKeep) {
            tempProjectsInClass.push(this.projectsStorage[i]);
          }
        }

        if (tempProjectsInClass.length < 6) {
          this.maxDisplayNumber = tempProjectsInClass.length;
        } else {
          this.maxDisplayNumber = 6;
        }

        if (this.rotation.length != tempProjectsInClass.length) {
          this.createRotationArray(tempProjectsInClass.length);
        }
        var tempDisplayStorage = [];
        for (var j = 0; j < this.displayNumber; j++) {
          tempDisplayStorage.push(tempProjectsInClass[this.rotation[j]]);
        }

        this.displayStorage = tempDisplayStorage;
        var tempRotation = this.rotation[0];
        this.rotation.shift();
        this.rotation.push(tempRotation);
      }
      if (this.window == "Projekte") {
        this.rotationIntervalID = setInterval(
          function() {
            this.createDisplay();
          }.bind(this),
          30000
        );
      }
    },

    //returns true or false whether the project has members of the selected class.
    compareMembersToClass(currentProject) {
      var tempKeep = false;
      for (var i = 0; i < this.studentsStorage.length; i++) {
        var tempStudentName =
          this.studentsStorage[i].prename +
          " " +
          this.studentsStorage[i].surname;
        for (var j = 0; j < currentProject.members.length; j++) {
          if (tempStudentName == currentProject.members[j]) {
            tempKeep = true;
            return tempKeep;
          }
        }
      }
      return tempKeep;
    },

    //creates an array that aids the rotation
    createRotationArray(length) {
      this.rotation = [];
      for (var i = 0; i < length; i++) {
        this.rotation.push(i);
      }
    },

    //login forwards to the hashing process
    clickLogin() {
      this.hashInput();
    },

    //preparing strings, sending it to the compare and evaluates whether the user can access the settings or not
    async hashInput() {
      let tempUsername = this.hashString(this.loginUsername);
      let tempPassword = this.hashString(this.loginPassword);
      let access = await this.compareDBLogin(tempUsername, tempPassword);
      if (access) {
        this.window = "Einstellungen";
      }
    },

    //hashing strings
    hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash += Math.pow(str.charCodeAt(i) * 31, str.length - i);
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    },

    //gets the logins and checks if any entry is identical to what has been given and hashed
    async compareDBLogin(tempUsername, tempPassword) {
      let tempLoginGetter = await axios.get(`/api/login`);
      tempLoginGetter = tempLoginGetter.data;
      for (var i = 0; i < tempLoginGetter.length; i++) {
        if (
          tempLoginGetter[i].user == tempUsername &&
          tempLoginGetter[i].password == tempPassword
        ) {
          return true;
        }
      }
      return false;
    }
  },

  //closing the application turns these intervals off.
  beforeDestroy() {
    clearInterval(this.dataUpdaterIntervalID);
    clearInterval(this.timeUpdaterIntervalID);
  }
};
</script>
<style>
ul {
  list-style: none;
}
.whiteBC {
  background-color: white;
}
.redBC {
  background-color: rgb(255, 125, 125);
}
.yellowBC {
  background-color: yellow;
}
.greenBC {
  background-color: rgb(0, 255, 0);
}
</style>