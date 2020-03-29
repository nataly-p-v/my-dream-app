import {AbstractControl} from '@angular/forms';

export function DateValidator(control: AbstractControl): { [key: string]: boolean} | null {
  const startDate = control.get('startDate').value;
  const endDate = control.get('endDate').value;
  if (Date.parse(endDate) >= Date.parse(startDate)) {
    return { dateValid: true };
  } else {
    return { dateValid: false };
  }
}
