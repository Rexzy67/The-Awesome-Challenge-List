import { round, score } from './score.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = '/data';

function normalizeLevel(level, path) {
    return {
        ...level,
        path,
        percentToQualify: Number(level.percentToQualify),
        records: Array.isArray(level.records)
            ? level.records
                .map((record) => ({
                    ...record,
                    percent: Number(record.percent),
                    hz: Number(record.hz),
                }))
                .sort((a, b) => b.percent - a.percent)
            : [],
    };
}

function getCanonicalName(map, name) {
    return Object.keys(map).find(
        (user) => user.toLowerCase() === name.toLowerCase(),
    ) || name;
}

export async function fetchList() {
    try {
        const listResult = await fetch(`${dir}/_list.json`);
        const list = await listResult.json();
        return await Promise.all(
            list.map(async (path, rank) => {
                try {
                    const levelResult = await fetch(`${dir}/${path}.json`);
                    const level = await levelResult.json();
                    return [normalizeLevel(level, path), null];
                } catch {
                    console.error(`Failed to load level #${rank + 1} ${path}.`);
                    return [null, path];
                }
            }),
        );
    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();
    if (!list) {
        return [[], ['_list']];
    }

    const scoreMap = {};
    const errs = [];
    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        // Verification
        const verifier = getCanonicalName(scoreMap, level.verifier);
        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };
        const { verified } = scoreMap[verifier];
        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification,
        });

        // Records
        level.records.forEach((record) => {
            const user = getCanonicalName(scoreMap, record.user);
            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            const { completed, progressed } = scoreMap[user];
            if (record.percent === 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                });
                return;
            }

            progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(rank + 1, record.percent, level.percentToQualify),
                link: record.link,
            });
        });
    });

    // Wrap in extra Object containing the user and total score
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
}
