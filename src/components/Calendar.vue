<template>
  <div class="calendar">
    <div class="calendar__btn-box">
      <button 
        class="calendar__btn" 
        @click="setWeek('backward')"
      >
        <i class="bi bi-chevron-left calendar__icon" />
      </button>
      <button 
        class="calendar__btn"
        @click="setWeek('forward')"
      >
        <i class="bi bi-chevron-right calendar__icon" />
      </button>
      <button
        class="calendar__btn" 
        @click="setWeek()"
      >
        Today
      </button>
    </div>
    <div class="calendar__week">
      <div class="calendar__days">
        <div
          v-for="(date, idx) in weekDates"
          :key="idx"
          :class="'day-' + idx"
          class="calendar__day"
        >
          {{ date }}
        </div>
      </div>
      <div class="calendar__rooms">
        <div
          v-for="room in bookingsEditedData"
          :key="room.name"
          class="calendar__room"
        >
          <div class="calendar__room-text">
            {{ room.roomName }}
          </div>

          <div
            v-for="(date, idx) in weekWithHalfDates"
            :key="idx"
            class="calendar__person"
            :style="{ gridColumn: gridCalculation(isBooked(room.roomName, date)) }"
          >
            <div
              :class="{ 'calendar__person-name': isBooked(room.roomName, date) }"
              :style="{ position: isBooked(room.roomName, date).id === selectedBookingId ? 'relative' : 'static' }"
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
      :popup-position="popupPosition"
      :booking-id="selectedBookingId"
      @close="isOpenModel = false"
    />
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import Popup from "./Popup.vue";

export default {
  name: "Calendar",
  components: {
    Popup,
  },
  data() {
    return {
      weekDates: [],
      fromDate: new Date(),
      isOpenModel: false,
      selectedBookingId: null,
      popupPosition: { top: 0, left: 0 },
    };
  },
  computed: {
    ...mapState(["bookings", "bookingsEditedData"]),
    weekWithHalfDates() {
      let convertedDate = [];
      this.weekDates.forEach((item) => {
        convertedDate.push({ date: item, partDay: "first" });
        convertedDate.push({ date: item, partDay: "second" });
      });
      return convertedDate;
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    ...mapMutations(["convertAndSetBookingsEditedData"]),
    getData() {
      this.convertAndSetBookingsEditedData();
      this.generateDates(this.fromDate);
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
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
      let newDate = new Date(this.fromDate);
      if (movementDirections === "forward") {
        newDate.setDate(newDate.getDate() + 7); // Add 7 days to fromDate
      } else if (movementDirections === "backward") {
        newDate.setDate(newDate.getDate() - 7); // return previous 7 days to fromDate
      } else {
        newDate = new Date(); // reset
      }

      this.fromDate = newDate;
      this.isOpenModel = false;
      this.generateDates(this.fromDate);
    },
    isBooked(roomName, date) {
      const room = this.bookingsEditedData.find(
        (item) => item.roomName === roomName
      );
      const currentDate = new Date(date.date);
      const firstWeekDay = new Date(this.weekDates[0]);

      // filter reservations to find bookings which are happend in the scope of current week
      const reservationsOnDate = room.reservations.filter((reservation) => {
        const reservationStart = new Date(reservation.start);
        const reservationEnd = new Date(reservation.end);
        // condition for event which starts in current week
        const isInCurrentWeek = reservationStart.getTime() === currentDate.getTime() && date.partDay === "second";
        // condition for event that not starts not in current week but includes in
        const isNotInCurrentWeek = currentDate.getTime() > reservationStart.getTime() && currentDate.getTime() <= reservationEnd.getTime() && currentDate.getTime() <= firstWeekDay.getTime() && date.partDay === "first";

        // adjust grid column start and span based on reservation's duration and position in the week
        if (isInCurrentWeek) {
          const daysDifference = Math.ceil((reservationEnd - reservationStart) / (1000 * 60 * 60 * 24));
          const daysFromStartOfWeek = Math.ceil((currentDate - firstWeekDay) / (1000 * 60 * 60 * 24));

          if (daysFromStartOfWeek + daysDifference > 14) {
            reservation.gridColumnStart = 1;
          } else {
            reservation.gridColumnStart = Math.max(daysFromStartOfWeek + 1, 1) * 2;
          }

          reservation.gridSpan = Math.min(daysDifference, 14 - reservation.gridColumnStart + 1) * 2;
        } else if (isNotInCurrentWeek) {
          reservation.gridColumnStart = 1;
          reservation.gridSpan = Math.min(reservationEnd.getDate() - firstWeekDay.getDate() + 1, 7) * 2 - 1;
        }

        return isInCurrentWeek || isNotInCurrentWeek;
      });

      if (reservationsOnDate.length === 0) return false;

      return reservationsOnDate[0]
        ? {
            gridColumnStart: reservationsOnDate[0].gridColumnStart + 1,
            gridSpan: reservationsOnDate[0].gridSpan,
            name: reservationsOnDate[0].name,
            id: reservationsOnDate[0].id,
            start: reservationsOnDate[0].start,
            end: reservationsOnDate[0].end,
          }
        : "";
    },

    gridCalculation(data) {
      if (data.gridColumnStart && data.gridSpan)
        return `${data.gridColumnStart} / span ${data.gridSpan}`;
    },
    showPopup(bookingId, event) {
      const clickedElement = event.target;
      // get position of clicked element
      const rect = clickedElement.getBoundingClientRect();
      this.popupPosition = {
        // adjust for scroll position
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      };

      this.isOpenModel = true;
      this.selectedBookingId = bookingId;
    },
  },
};
</script>

<style lang="scss">
.calendar {
  &__btn-box {
    margin-bottom: 50px;
  }

  &__btn {
    width: 60px;
    height: 30px;
    background-color: #252569;
    border: none;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;

    &:not(:last-child) {
      margin-right: 10px;
    }
  }

  &__icon {
    color: #fff;
  }

  &__week {
    border: 1px solid #eee;
    overflow: hidden;
    position: relative;
  }

  &__days {
    display: grid;
    grid-template-columns: 300px repeat(14, 1fr);
  }

  &__day {
    grid-column: span 2;
    text-align: center;

    &:first-child {
      grid-column: 2 / span 2;
    }

    &::before {
      content: "";
      position: absolute;
      border: 1px solid #eee;
      height: 100%;
      bottom: 0;
    }
  }

  &__room {
    position: relative;
    display: grid;
    grid-template-columns: 300px repeat(14, 1fr);
    grid-auto-flow: column;
    overflow: hidden;
    height: 70px;

    &::after {
      content: "";
      position: absolute;
      border: 1px solid #eee;
      width: 100%;
      top: 0;
    }
  }

  &__room-text {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #7cb27c;
    width: 300px;
  }

  &__person {
    position: relative;
    z-index: 1;
  }

  &__person-name {
    height: 70px;
    background-color: cornflowerblue;
    color: #fff;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
  }

  @for $i from 0 through 6 {
    .day-#{$i}::before {
      position: absolute;
      left: if($i == 0, 300px, calc(300px + (#{$i} * (100% - 300px) / 7)));
    }
  }
}
</style>
