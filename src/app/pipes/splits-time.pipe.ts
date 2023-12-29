import { Pipe, PipeTransform } from '@angular/core';
import { Split } from '../video/video.component';

@Pipe({
	name: 'splitsTime',
	standalone: true,
})
export class SplitsTimePipe implements PipeTransform {

	transform(splits?: Split[]): number {
		if (!splits || splits.length <= 1) {
			return NaN;
		}

		const start = splits[0].timestamp;
		const end = splits[splits.length - 1].timestamp;

		return end - start;
	}

}
