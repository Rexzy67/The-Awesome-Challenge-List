import { fetchList } from '../content.js';
import { getThumbnailFromId, getYoutubeIdFromUrl, shuffle } from '../util.js';

import Spinner from '../components/Spinner.js';
import Btn from '../components/Btn.js';

export default {
    components: { Spinner, Btn },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-roulette">
            <div class="sidebar">
                <p class="type-label-md" style="color: #aaa">
                    Shameless copy of the Extreme Demon Roulette by <a href="https://matcool.github.io/extreme-demon-roulette/" target="_blank" rel="noopener noreferrer">matcool</a>.
                </p>
                <form class="options">
                    <div class="check">
                        <input type="checkbox" id="main" value="Main List" v-model="useMainList">
                        <label for="main">Main List</label>
                    </div>
                    <div class="check">
                        <input type="checkbox" id="extended" value="Extended List" v-model="useExtendedList">
                        <label for="extended">Extended List</label>
                    </div>
                    <Btn :disabled="!useMainList && !useExtendedList" @click.prevent="onStart">{{ levels.length === 0 ? 'Start' : 'Restart'}}</Btn>
                </form>
                <p class="type-label-md" style="color: #aaa">
                    The roulette saves automatically.
                </p>
                <form class="save">
                    <p>Manual Load/Save</p>
                    <div class="btns">
                        <Btn @click.prevent="onImport">Import</Btn>
                        <Btn :disabled="!isActive" @click.prevent="onExport">Export</Btn>
                    </div>
                </form>
            </div>
            <section class="levels-container">
                <div class="levels">
                    <template v-if="levels.length > 0">
                        <!-- Completed Levels -->
                        <div class="level" v-for="(level, i) in levels.slice(0, progression.length)">
                            <a :href="level.video" target="_blank" rel="noopener noreferrer" class="video">
                                <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.video))" alt="">
                            </a>
                            <div class="meta">
                                <p>#{{ level.rank }}</p>
                                <h2>{{ level.name }}</h2>
                                <p style="color: #00b54b; font-weight: 700">{{ progression[i] }}%</p>
                            </div>
                        </div>
                        <!-- Current Level -->
                        <div class="level" v-if="!hasCompleted">
                            <a :href="currentLevel.video" target="_blank" rel="noopener noreferrer" class="video">
                                <img :src="getThumbnailFromId(getYoutubeIdFromUrl(currentLevel.video))" alt="">
                            </a>
                            <div class="meta">
                                <p>#{{ currentLevel.rank }}</p>
                                <h2>{{ currentLevel.name }}</h2>
                                <p>{{ currentLevel.id }}</p>
                            </div>
                            <form class="actions" v-if="!givenUp">
                                <input type="number" v-model.number="percentage" :placeholder="placeholder" :min="currentPercentage + 1" max=100>
                                <Btn :disabled="!canSubmitPercentage" @click.prevent="onDone">Done</Btn>
                                <Btn @click.prevent="onGiveUp" style="background-color: #e91e63;">Give Up</Btn>
                            </form>
                        </div>
                        <!-- Results -->
                        <div v-if="givenUp || hasCompleted" class="results">
                            <h1>Results</h1>
                            <p>Number of levels: {{ progression.length }}</p>
                            <p>Highest percent: {{ currentPercentage }}%</p>
                            <Btn v-if="currentPercentage < 99 && !hasCompleted" @click.prevent="showRemaining = true">Show remaining levels</Btn>
                        </div>
                        <!-- Remaining Levels -->
                        <template v-if="givenUp && showRemaining">
                            <div class="level" v-for="(level, i) in levels.slice(progression.length + 1, levels.length - currentPercentage + progression.length)">
                                <a :href="level.video" target="_blank" rel="noopener noreferrer" class="video">
                                    <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.video))" alt="">
                                </a>
                                <div class="meta">
                                    <p>#{{ level.rank }}</p>
                                    <h2>{{ level.name }}</h2>
                                    <p style="color: #d50000; font-weight: 700">{{ currentPercentage + 2 + i }}%</p>
                                </div>
                            </div>
                        </template>
                    </template>
                </div>
            </section>
            <div class="toasts-container">
                <div class="toasts">
                    <div v-for="toast in toasts" class="toast">
                        <p>{{ toast }}</p>
                    </div>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        loading: false,
        levels: [],
        progression: [], // list of percentages completed
        percentage: undefined,
        givenUp: false,
        showRemaining: false,
        useMainList: true,
        useExtendedList: true,
        toasts: [],
        fileInput: undefined,
    }),
    mounted() {
        // Create File Input
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.multiple = false;
        this.fileInput.accept = '.json,application/json';
        this.fileInput.addEventListener('change', this.onImportUpload);

        // Load progress from local storage
        let roulette;
        try {
            roulette = JSON.parse(localStorage.getItem('roulette'));
        } catch {
            localStorage.removeItem('roulette');
            return;
        }

        if (!roulette) {
            return;
        }

        if (!this.applyRoulette(roulette, false)) {
            localStorage.removeItem('roulette');
        }
    },
    computed: {
        currentLevel() {
            return this.levels[this.progression.length];
        },
        currentPercentage() {
            return this.progression[this.progression.length - 1] || 0;
        },
        placeholder() {
            return `At least ${this.currentPercentage + 1}%`;
        },
        hasCompleted() {
            return (
                this.levels.length > 0 &&
                (
                    this.progression[this.progression.length - 1] >= 100 ||
                    this.progression.length === this.levels.length
                )
            );
        },
        isActive() {
            return (
                this.levels.length > 0 &&
                this.progression.length > 0 &&
                !this.givenUp &&
                !this.hasCompleted
            );
        },
        canSubmitPercentage() {
            return Number.isInteger(this.percentage)
                && this.percentage > this.currentPercentage
                && this.percentage <= 100;
        },
    },
    methods: {
        shuffle,
        getThumbnailFromId,
        getYoutubeIdFromUrl,
        async onStart() {
            if (this.isActive) {
                this.showToast('Give up before starting a new roulette.');
                return;
            }

            if (!this.useMainList && !this.useExtendedList) {
                return;
            }

            this.loading = true;

            const fullList = await fetchList();
            if (!fullList) {
                this.loading = false;
                this.showToast('Failed to load the list.');
                return;
            }

            if (fullList.filter(([_, err]) => err).length > 0) {
                this.loading = false;
                this.showToast(
                    'List is currently broken. Wait until it\'s fixed to start a roulette.',
                );
                return;
            }

            const fullListMapped = fullList.map(([lvl, _], i) => ({
                rank: i + 1,
                id: lvl.id,
                name: lvl.name,
                video: lvl.verification,
            })).filter((level) => getYoutubeIdFromUrl(level.video));
            const list = [];
            if (this.useMainList) list.push(...fullListMapped.slice(0, 75));
            if (this.useExtendedList) {
                list.push(...fullListMapped.slice(75, 150));
            }
            if (list.length === 0) {
                this.loading = false;
                this.showToast('No levels are available for the selected ranges.');
                return;
            }

            // random 100 levels
            this.levels = shuffle(list).slice(0, 100);
            this.showRemaining = false;
            this.givenUp = false;
            this.progression = [];
            this.percentage = undefined;

            this.save();
            this.loading = false;
        },
        save() {
            localStorage.setItem(
                'roulette',
                JSON.stringify({
                    levels: this.levels,
                    progression: this.progression,
                }),
            );
        },
        onDone() {
            if (!this.canSubmitPercentage) {
                this.showToast('Invalid percentage.');
                return;
            }

            this.progression.push(this.percentage);
            this.percentage = undefined;

            this.save();
        },
        onGiveUp() {
            this.givenUp = true;

            // Save progress
            localStorage.removeItem('roulette');
        },
        onImport() {
            if (
                this.isActive &&
                !window.confirm('This will overwrite the currently running roulette. Continue?')
            ) {
                return;
            }

            if (typeof this.fileInput.showPicker === 'function') {
                this.fileInput.showPicker();
                return;
            }

            this.fileInput.click();
        },
        async onImportUpload() {
            if (this.fileInput.files.length === 0) return;

            const file = this.fileInput.files[0];

            if (file.type && file.type !== 'application/json') {
                this.showToast('Invalid file.');
                this.fileInput.value = '';
                return;
            }

            try {
                const roulette = JSON.parse(await file.text());
                this.applyRoulette(roulette);
            } catch {
                this.showToast('Invalid file.');
                return;
            } finally {
                this.fileInput.value = '';
            }
        },
        onExport() {
            const file = new Blob(
                [JSON.stringify({
                    levels: this.levels,
                    progression: this.progression,
                })],
                { type: 'application/json' },
            );
            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = 'tacl_roulette.json';
            a.click();
            URL.revokeObjectURL(a.href);
        },
        applyRoulette(roulette, showErrors = true) {
            const result = this.validateRoulette(roulette);
            if (!result.valid) {
                if (showErrors) {
                    this.showToast(result.message);
                }
                return false;
            }

            this.levels = result.levels;
            this.progression = result.progression;
            this.save();
            this.givenUp = false;
            this.showRemaining = false;
            this.percentage = undefined;
            return true;
        },
        validateRoulette(roulette) {
            if (!roulette || typeof roulette !== 'object') {
                return { valid: false, message: 'Invalid file.' };
            }

            if (!Array.isArray(roulette.levels) || !Array.isArray(roulette.progression)) {
                return { valid: false, message: 'Invalid file.' };
            }

            if (roulette.progression.length > roulette.levels.length) {
                return { valid: false, message: 'Invalid save progress.' };
            }

            const levels = roulette.levels.map((level) => ({
                rank: Number(level.rank),
                id: Number(level.id),
                name: String(level.name || ''),
                video: String(level.video || ''),
            }));
            if (levels.some((level) => (
                !Number.isInteger(level.rank)
                || !Number.isFinite(level.id)
                || level.name.length === 0
                || !getYoutubeIdFromUrl(level.video)
            ))) {
                return { valid: false, message: 'Invalid level data.' };
            }

            const progression = roulette.progression.map(Number);
            const hasInvalidProgress = progression.some((percent, index) => (
                !Number.isInteger(percent)
                || percent <= 0
                || percent > 100
                || percent <= (progression[index - 1] || 0)
            ));
            if (hasInvalidProgress) {
                return { valid: false, message: 'Invalid save progress.' };
            }

            return { valid: true, levels, progression };
        },
        showToast(msg) {
            this.toasts.push(msg);
            setTimeout(() => {
                this.toasts.shift();
            }, 3000);
        },
    },
};
