import { Pipe, PipeTransform } from '@angular/core';
import { Split } from '../video/video.component';

@Pipe({
	name: 'splitTime',
	standalone: true,
})
export class SplitTimePipe implements PipeTransform {

	transform(splits: Split[], index: number): number {
		if (!splits || splits.length <= 1) {
			return NaN;
		}

		const start = splits[index - 1].timestamp;
		const end = splits[index].timestamp;

		return end - start;
	}

}
