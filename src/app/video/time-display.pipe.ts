import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'timeDisplay',
	standalone: true,
})
export class TimeDisplayPipe implements PipeTransform {

	transform(start?: number, end?: number): string {
		const diff = (end ?? 0) - (start ?? 0);
		const m = Math.floor(diff / 60);
		const s = Math.floor(diff % 60);
		const ms = Math.floor((diff % 1) * 1000);
		return `time:    ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}\nseconds: ${diff}`;
	}

}
