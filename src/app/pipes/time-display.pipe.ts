import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'timeDisplay',
	standalone: true,
})
export class TimeDisplayPipe implements PipeTransform {

	transform(seconds: number): string {
		if (isNaN(seconds)) {
			return '?';
		}
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		const ms = Math.floor((seconds % 1) * 1000);
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
	}

}
