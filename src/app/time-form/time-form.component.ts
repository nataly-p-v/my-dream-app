import {Component, OnInit} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import {FormBuilder} from '@angular/forms';
import {SubmitServiceService} from '../submit-service.service';
import * as uuid from 'uuid';


@Component({
  selector: 'app-time-form',
  templateUrl: './time-form.component.html',
  styleUrls: ['./time-form.component.scss']
})

export class TimeFormComponent implements OnInit {
  timeForm: FormGroup;
  timeFormFamily: FormGroup;
  items = ['working', 'clearing'];
  result = [];
  minStart;
  maxToday;
  maxEnd;
  maxHours = 23;
  maxMinutes = 59;
  min = 0;
  timeframe = {
    startBookingDate: '2020-02-26',
    endBookingDate: '2020-03-27'
  };
  myId = uuid.v4();

  constructor(private fb: FormBuilder, private submitServiceService: SubmitServiceService) {
  }

  ngOnInit() {
    this.timeForm = this.fb.group({
      startDate: ['', [Validators.required]],
      custId: [''],
      startHours: ['', [Validators.required, Validators.max(this.maxHours), Validators.min(this.min)]],
      startMinutes: ['', [Validators.required, Validators.max(this.maxMinutes), Validators.min(this.min)]],
      endDate: ['', [Validators.required]],
      endHours: ['', [Validators.required, Validators.max(this.maxHours), Validators.min(this.min)]],
      endMinutes: ['', [Validators.required, Validators.max(this.maxMinutes), Validators.min(this.min)]],
      responsibility: [''],
      isPreventive: ['true'],
      comment: ['default comment'],
    });
    // this.timeForm.get('startHours').valueChanges.subscribe(
    //   newValue => {
    //     const minutes = this.timeForm.get('startMinutes');
    //     if (newValue === '' || newValue === 0) {
    //       minutes.setValidators([Validators.required, Validators.min(15), Validators.max(this.maxMinutes)]);
    //     } else {
    //       minutes.setValidators([Validators.required, Validators.min(0), Validators.max(this.maxMinutes)]);
    //     }
    //     minutes.updateValueAndValidity();
    //   });
    // this.timeForm.get('endHours').valueChanges.subscribe(
    //   newValue => {
    //     const minutes = this.timeForm.get('endMinutes');
    //     if (newValue === '' || newValue === 0) {
    //       minutes.setValidators([Validators.required, Validators.min(15), Validators.max(this.maxMinutes)]);
    //     } else {
    //       minutes.setValidators([Validators.required, Validators.min(0), Validators.max(this.maxMinutes)]);
    //     }
    //     minutes.updateValueAndValidity();
    //   });
    this.timeFormFamily = this.fb.group({
      startDate: ['', [Validators.required]],
      startHours: ['', [Validators.required, Validators.max(this.maxHours), Validators.min(this.min)]],
      startMinutes: ['', [Validators.required, Validators.max(this.maxMinutes), Validators.min(this.min)]],
      responsibility: [''],
      isPreventive: ['true'],
      comment: ['default comment'],
    });

    if (this.timeframe.startBookingDate && this.timeframe.endBookingDate) {
      this.minStart = this.timeframe.startBookingDate;
      this.maxEnd = this.timeframe.endBookingDate;
    }
    const today = new Date(Date.now());
    this.maxToday = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + today.getDate();
  }

  onSubmit() {
    const isWeekend = this.checkIfAtLeastOneIsWeekend();
    const newEntry = {
      aufgabenbereich: this.timeForm.get('responsibility').value,
      order: this.myId,
      // dateStart: new Date(this.timeForm.get('startDate').value).toISOString(),
      // dateEnd: new Date(this.timeForm.get('endDate').value).toISOString(),
      // feiertagzuschlag: 0,
      dateStart: this.timeForm.get('startDate').value,
      dateEnd: this.timeForm.get('endDate').value,
      wochenendzuschlag: isWeekend,
      prevention_care: this.timeForm.get('isPreventive').value,
      description: this.timeForm.get('comment').value,
      duration: this.duration()
    };
    if (this.result.length >= 1) {
      for (let i = this.result.length; i--;) {
        if (this.result[i].dateStart === newEntry.dateStart) {
          console.log('already booked');
          return false;
        } else {
          this.result.push(newEntry);
        }
      }
    } else {
      this.result.push(newEntry);
    }
    console.log(this.result);
    this.submitServiceService.register(this.timeForm.value);
    this.timeForm.reset();
  }

  onSubmitFamily() {
    const isWeekend = this.checkIfAtLeastOneIsWeekend();
    const newEntry = {
      aufgabenbereich: this.timeFormFamily.get('responsibility').value,
      order: this.myId,
      dateStart: this.timeFormFamily.get('startDate').value,
      wochenendzuschlag: isWeekend,
      prevention_care: this.timeFormFamily.get('isPreventive').value,
      description: this.timeFormFamily.get('comment').value,
    };
    if (this.result.length >= 1) {
      for (let i = this.result.length; i--;) {
        if (this.result[i].dateStart === newEntry.dateStart) {
          console.log('already booked');
          return false;
        } else {
          this.result.push(newEntry);
        }
      }
    } else {
      this.result.push(newEntry);
    }
    console.log(this.result);
    this.submitServiceService.register(this.timeFormFamily.value);
    this.timeFormFamily.reset();
  }

  deleteRow(id) {
    for (let i = 0; i < this.result.length; ++i) {
      if (i === id) {
        this.result.splice(i, 1);
      }
    }
  }

  calculateDaysBetween(start, finish) {
    return (new Date(finish).getTime() - new Date(start).getTime()) / (24 * 60 * 60 * 1000); // /86400000
  }

  checkIfNotMoreThanADay() {
    const numberDays = this.calculateDaysBetween(this.timeForm.get('startDate').value, this.timeForm.get('endDate').value);
    return (numberDays === 0 || numberDays === 1);
  }

  isValid() {
    if (this.checkIfNotMoreThanADay() && this.checkIfEndDateAfterStartDate()) {
      this.timeForm.get('custId').setErrors({'incorrect': null});
      this.timeForm.get('custId').updateValueAndValidity();
    } else {
      this.timeForm.get('custId').setErrors({'incorrect': true});
    }
  }

  duration() {
    const startD = this.timeForm.get('startDate').value;
    const startH = this.timeForm.get('startHours').value;
    const startM = this.timeForm.get('startMinutes').value;
    const endD = this.timeForm.get('endDate').value;
    const endH = this.timeForm.get('endHours').value;
    const endM = this.timeForm.get('endMinutes').value;
    const start = new Date(`${startD} ${startH}: ${startM}`);
    const end = new Date(`${endD} ${endH}: ${endM}`);
    return (this.timeDiff(start, end));
  }

  timeDiff(start, end) {
    // Get the diff
    let diff = end - start;
    // Create numbers for dividing to get hour, minute and second diff
    const units = [
      1000 * 60 * 60 * 24,
      1000 * 60 * 60,
      1000 * 60,
      1000
    ];

    const rv = []; // h, m, s array
    // loop through d, h, m, s. we are not gonna use days, its just there to subtract it from the time
    for (let i = 0; i < units.length; ++i) {
      rv.push(Math.floor(diff / units[i]));
      diff = diff % units[i];
    }

    // Get the year of this year
    let thisFullYear = end.getFullYear();
    // Check how many days there where in last month
    const daysInLastMonth = new Date(thisFullYear, end.getMonth(), 0).getDate();
    // Get this month
    let thisMonth = end.getMonth();
    // Subtract to get differense between years
    thisFullYear = thisFullYear - start.getFullYear();
    // Subtract to get differense between months
    thisMonth = thisMonth - start.getMonth();
    // If month is less than 0 it means that we are some moths before the start date in the year.
    // So we subtract one year, and add the negative number (month) to 12. (12 + -1 = 11)
    let subAddDays = daysInLastMonth - start.getDate();
    const thisDay = end.getDate();
    thisMonth = thisMonth - 1;
    if (thisMonth < 0) {
      thisFullYear = thisFullYear - 1;
      thisMonth = 12 + thisMonth;
      // Get ends day of the month
    }
    // Subtract the start date from the number of days in the last month, add add the result to todays day of the month
    subAddDays = daysInLastMonth - start.getDate();
    subAddDays = thisDay + subAddDays;


    if (subAddDays >= daysInLastMonth) {
      subAddDays = subAddDays - daysInLastMonth;
      thisMonth++;
      if (thisMonth > 11) {
        thisFullYear++;
        thisMonth = 0;
      }
    }
    return {
      years: thisFullYear,
      months: thisMonth,
      days: subAddDays,
      hours: rv[1],
      minutes: rv[2],
      seconds: rv[3]
    };
  }

  checkIfAtLeastOneIsWeekend() {
    const start = new Date(this.timeForm.get('startDate').value);
    const finish = new Date(this.timeForm.get('endDate').value);
    return ((start.getDay() === 6 || start.getDay() === 0) || (finish.getDay() === 6 || finish.getDay() === 0)) ? 1 : 0;
  }

  checkIfEndDateAfterStartDate() {
    // const start = new Date(this.timeForm.get('startDate').value);
    // const finish = new Date(this.timeForm.get('endDate').value);
    // return (finish.getTime() <= start.getTime());
    return (this.duration().days < 0 || this.duration().hours < 0 || this.duration().minutes < 15 || this.duration().seconds < 0) ? false : true;
  }
}
