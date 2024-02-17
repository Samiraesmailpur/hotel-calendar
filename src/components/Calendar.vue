<template>
  <div class="calendar-container">
    <div class="calendar-btn-box">
      <button
        class="calendar-btn"
        @click="setWeek('backward')"
      >
        <i class="bi bi-chevron-left calendar-icon" /> 
      </button>
      <button 
        class="calendar-btn"
        @click="setWeek('forward')"
      >
        <i class="bi bi-chevron-right calendar-icon" />
      </button>
      <button
        class="calendar-btn"
        @click="setWeek()"
      >
        Today
      </button>
      {{ modalPosition }}
    </div>
    <div
      class="calendar-week"
    >
      <div class="calendar-days">
        <div
          v-for="(date, index) in weekDates"
          :key="index"
          class="calendar-day"
        >
          {{ date }}
        </div>
      </div>
      <div class="calendar-rooms">
        <div
          v-for="(room, index) in bookingsEditedData"
          :key="index"
          class="calendar-room"
        >
          <div class="calendar-room-text">
            {{ room.roomName }}
          </div>
          <div
            v-for="(date, index) in weekDates"
            :key="index"
            class="calendar-day"
            :style="{
              gridColumn: gridCalculation(isBooked(room.roomName, date)),
              paddingLeft: isBooked(room.roomName, date).start === date ? `calc((100% / ${isBooked(room.roomName, date).gridSpan}) / 2)` : '0',
              paddingRight: isBooked(room.roomName, date).end ? `calc((100% / ${isBooked(room.roomName, date).gridSpan}) / 2)` : '0'
            }"
          >
            <div
              :class="{ 'calendar-person': isBooked(room.roomName, date) }"
              :style="{
                position: isBooked(room.roomName, date).id === selectedBookingId ? 'relative' : 'static',
              }"
              @click="showPopup(isBooked(room.roomName, date).id, $event)"
            >            
              {{ isBooked(room.roomName, date).name }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <Popup
      v-if="isOpenModel"
      :modal-position="modalPosition"
      :booking-id="selectedBookingId"
      @close="isOpenModel = false"
    />
  </div>
</template>


<script>


import { mapState, mapMutations } from 'vuex';
import Popup from './Popup.vue'

export default {
  name: "Calendar",
  components:{ 
    Popup
  },
  data() {
    return {
      weekDates: [],
      fromDate: new Date(),
      rooms: [],
      isOpenModel: false,
      selectedBookingId: null,
      modalPosition: { top: 0, left: 0 },
    };
  },
  computed: {
    ...mapState([
      'bookings',
      'bookingsEditedData'
    ]),
  },
    
  mounted() {
    this.getData(); 
  },
  methods: {
    ...mapMutations([
      'convertAndSetBookingsEditedData'
    ]),
    getData() {
      this.convertAndSetBookingsEditedData();
      this.generateDates(this.fromDate);
      this.rooms = Array.from(new Set(this.bookings.map(item => item.roomDetails.name)));
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    generateDates(from) {
      this.weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(from);
        date.setDate(from.getDate() + i);
        this.weekDates.push(this.formatDate(date));
      }
    },
    setWeek(movementDirections) {
      if (movementDirections === 'forward') {
        const nextWeek = new Date(this.fromDate);
        nextWeek.setDate(nextWeek.getDate() + 7); // Add 7 days to fromDate
        this.fromDate = nextWeek;
      } else if (movementDirections === 'backward') {
        const previousWeek = new Date(this.fromDate);
        previousWeek.setDate(previousWeek.getDate() - 7); // return previous 7 days to fromDate
        this.fromDate = previousWeek;
      } else {
        this.fromDate = new Date;
      }
      this.isOpenModel = false
      this.generateDates(this.fromDate);
    },
    isBooked(roomName, date) {
      const room = this.bookingsEditedData.find(item => item.roomName === roomName);
      const currentDate = new Date(date);
      const firstWeekDay = new Date(this.weekDates[0]);

      const reservationsOnDate = room.reservations.filter(reservation => {
          const reservationStart = new Date(reservation.start);
          const reservationEnd = new Date(reservation.end);
          if (currentDate >= reservationStart && currentDate <= reservationEnd && currentDate <= firstWeekDay) {
            reservation.gridColumnStart = 1;
            reservation.gridSpan = Math.min(reservationEnd.getDate() - firstWeekDay.getDate() + 1, 7);
          }
          if(reservationStart.getTime() === currentDate.getTime()) {
            reservation.gridColumnStart = Math.max(currentDate.getDate() - firstWeekDay.getDate() + 1, 1);
            reservation.gridSpan = Math.min(reservationEnd.getDate() - currentDate.getDate() + 1, 7 - reservation.gridColumnStart + 1);
          }
          return reservationStart.getTime() === currentDate.getTime() ||
                (currentDate >= reservationStart && currentDate <= reservationEnd && currentDate <= firstWeekDay);
      });

      if (reservationsOnDate.length === 0) return false;
      return reservationsOnDate[0] ? {
        gridColumnStart: reservationsOnDate[0].gridColumnStart + 1,
        gridSpan: reservationsOnDate[0].gridSpan,
        name: reservationsOnDate[0].name,
        id: reservationsOnDate[0].id,
        start: reservationsOnDate[0].start,
        end: this.weekDates.includes(reservationsOnDate[0].end),
      } : '';
    },  
    gridCalculation(data) {
      if (data.gridColumnStart && data.gridSpan) return `${data.gridColumnStart} / span ${data.gridSpan}`;
    },
    showPopup(bookingId, event) {
      const clickedElement = event.target;
      const rect = clickedElement.getBoundingClientRect(); // Get position of clicked element
      this.modalPosition = {
        top: rect.top + window.pageYOffset, // Adjust for scroll position
        left: rect.left + window.pageXOffset,
      };

      this.isOpenModel = true;
      this.selectedBookingId = bookingId;
    },
  },
};
</script>


<style>


.calendar-week {
  border: 1px solid #eee;
  overflow: hidden;
}

.calendar-btn-box {
  margin-bottom: 50px;
}

.calendar-btn {
  width: 60px;
  height: 30px;
  background-color: #252569;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
}

.calendar-btn:not(:last-child){
  margin-right: 10px;
}

.calendar-icon {
  color: #fff;
}

.calendar-days {
  display: grid;
  grid-template-columns: 300px 150px repeat(6, 1fr);
}

.calendar-day:first-child {
  grid-column-start: 2;
}

.calendar-day {
  text-align: center;
}

.calendar-room {
  position: relative;
  display: grid;
  grid-template-columns: 300px 150px repeat(6, 1fr);
  grid-auto-flow: column;
  overflow: hidden;
  height: 70px;
} 

.calendar-room::after {
  content: '';
  position: absolute;
  border: 1px solid #eee;
  width: 100%;
  top: 0;
  left: 0;
}

.calendar-room-text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #7cb27c;
}

.calendar-day {
  position: relative;
  
}

.calendar-day::after {
  content: '';
  position: absolute;
  border: 1px solid #eee;
  height: 100%;
  bottom: 0;
  left: 0;
}


.calendar-person {
  height: 70px;
  background-color: cornflowerblue;
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
}

 .calendar-person--white {
  background-color: #fff;
  color: cornflowerblue;
}



</style>

