import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const timeRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  let start = control.get('start')?.value;
  let end = control.get('end')?.value;

  let startWhere = start.substring(start.length - 2, start.length);
  start = start.replace(':', '').replace(' AM', '').replace(' PM', '');
  let startNum = startWhere == 'PM' ? parseInt(start) + 1200 : start == 1200 ? 0 : parseInt(start);

  let endWhere = end.substring(end.length - 2, end.length);
  end = end.replace(':', '').replace(' AM', '').replace(' PM', '');
  let endNum = endWhere == 'PM' ? parseInt(end) + 1200 : end == 1200 ? 0 : parseInt(end);

  if (!endNum && endNum != 0) {
    return null;
  }
  if (startNum > endNum) {
    return { timeRangeValidErr: `end time can not before start time` };
  } else {
    return null;
  }
};
