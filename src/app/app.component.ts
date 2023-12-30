import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { Split, VideoComponent, VideoEvent } from './video/video.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject } from 'rxjs';

interface StoreableData {
	sync: boolean;
	splits1: Split[];
	splits2: Split[];
}

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet, MatCardModule, MatInputModule, VideoComponent, MatButtonModule, MatSlideToggleModule],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, StoreableData {
	@ViewChild('vid1') vid1!: VideoComponent;
	@ViewChild('vid2') vid2!: VideoComponent;


	sync = false;
	title = 'split-sync';

	events1 = new Subject<VideoEvent>();
	events2 = new Subject<VideoEvent>();

	currentSplit = -1;

	splits1: Split[] = [];

	splits2: Split[] = [];

	private timeout = -1;

	ngOnInit() {

		const storageKey = 'data';
		window.onbeforeunload = () => {
			const toSave: StoreableData = {
				sync: this.sync,
				splits1: this.splits1,
				splits2: this.splits2,
			};
			localStorage.setItem(storageKey, JSON.stringify(toSave));
		};

		let storedData: Partial<StoreableData> = {};
		try {
			const storedDataString = localStorage.getItem(storageKey);
			storedData = JSON.parse(storedDataString!);
			Object.assign(this, storedData);
		} catch (e) {
			console.error(e);
		}

		this.events1.subscribe(v => {
			switch (v) {
				case VideoEvent.PLAYED:
					this.playAll();
					break;
				case VideoEvent.PAUSED:
					this.pauseAll();
					break;
				case VideoEvent.SEEKED:
					this.currentSplit = -1;
					break;
			}
		});

		const sync = async () => {
			await this.syncVids(this.vid1, this.vid2);
			requestAnimationFrame(sync);
		};

		requestAnimationFrame(sync);
	}

	private async syncVids(v1: VideoComponent, v2: VideoComponent) {
		if (!this.sync) {
			this.currentSplit = -1;
			return;
		}
		clearTimeout(this.timeout);
		const currTime = v1.currentSeconds();
		let bestIndex = 0;
		for (let i = 0; i < v1.splits.length; i++) {
			const time = v1.splits[i].timestamp;
			bestIndex = i;
			if (time > currTime) {
				break;
			}
		}
		if (bestIndex === this.currentSplit) {
			return;
		}
		this.currentSplit = bestIndex;

		if (bestIndex === 0) {
			return;
		}

		const splitDiff = currTime - v1.splits[bestIndex - 1].timestamp;

		const shouldPlay = v1.playing();

		if (shouldPlay) {
			v1.video.nativeElement.pause();
		}
		v2.video.nativeElement.currentTime = v2.splits[bestIndex - 1].timestamp + splitDiff;
		await new Promise(res => {
			this.timeout = setTimeout(res, 600);
		});
		if (shouldPlay) {
			await v1.video.nativeElement.play();
		}
	}

	private playAll() {
		if (!this.vid1.playing()) {
			this.vid1.video.nativeElement.play();
		}
		if (!this.vid2.playing()) {
			this.vid2.video.nativeElement.play();
		}
	}

	private pauseAll() {
		if (this.vid1.playing()) {
			this.vid1.video.nativeElement.pause();
		}
		if (this.vid2.playing()) {
			this.vid2.video.nativeElement.pause();
		}
	}
}
