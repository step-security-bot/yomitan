/*
 * Copyright (C) 2016  Alex Yatskov <alex@foosoft.net>
 * Author: Alex Yatskov <alex@foosoft.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


function optionsFieldTemplates() {
    return `
{{#*inline "glossary-single"}}
    {{~#unless brief~}}
        {{~#if tags~}}<i>({{#each tags}}{{name}}{{#unless @last}}, {{/unless}}{{/each}})</i> {{/if~}}
    {{~/unless~}}
    {{~#if glossary.[1]~}}
        <ul>{{#each glossary}}<li>{{#multiLine}}{{.}}{{/multiLine}}</li>{{/each}}</ul>
    {{~else~}}
        {{~#multiLine}}{{glossary.[0]}}{{/multiLine~}}
    {{~/if~}}
{{/inline}}

{{#*inline "audio"}}{{/inline}}

{{#*inline "character"}}
    {{~definition.character~}}
{{/inline}}

{{#*inline "dictionary"}}
    {{~definition.dictionary~}}
{{/inline}}

{{#*inline "expression"}}
    {{~#if modeTermKana~}}
        {{~#if definition.reading~}}
            {{definition.reading}}
        {{~else~}}
            {{definition.expression}}
        {{~/if~}}
    {{~else~}}
        {{definition.expression}}
    {{~/if~}}
{{/inline}}

{{#*inline "furigana"}}
    {{#furigana}}{{{definition}}}{{/furigana}}
{{/inline}}

{{#*inline "furigana-plain"}}
    {{#furiganaPlain}}{{{definition}}}{{/furiganaPlain}}
{{/inline}}

{{#*inline "glossary"}}
    <div style="text-align: left;">
    {{~#if modeKanji~}}
        {{~#if definition.glossary.[1]~}}
            <ol>{{#each definition.glossary}}<li>{{.}}</li>{{/each}}</ol>
        {{~else~}}
            {{definition.glossary.[0]}}
        {{~/if~}}
    {{~else~}}
        {{~#if group~}}
            {{~#if definition.definitions.[1]~}}
                <ol>{{#each definition.definitions}}<li>{{> glossary-single brief=../brief}}</li>{{/each}}</ol>
            {{~else~}}
                {{~> glossary-single definition.definitions.[0] brief=brief~}}
            {{~/if~}}
        {{~else~}}
            {{~> glossary-single definition brief=brief~}}
        {{~/if~}}
    {{~/if~}}
    </div>
{{/inline}}

{{#*inline "glossary-brief"}}
    {{~> glossary brief=true ~}}
{{/inline}}

{{#*inline "kunyomi"}}
    {{~#each definition.kunyomi}}{{.}}{{#unless @last}}, {{/unless}}{{/each~}}
{{/inline}}

{{#*inline "onyomi"}}
    {{~#each definition.onyomi}}{{.}}{{#unless @last}}, {{/unless}}{{/each~}}
{{/inline}}

{{#*inline "reading"}}
    {{~#unless modeTermKana}}{{definition.reading}}{{/unless~}}
{{/inline}}

{{#*inline "sentence"}}
    {{~#if definition.cloze}}{{definition.cloze.sentence}}{{/if~}}
{{/inline}}

{{#*inline "cloze-prefix"}}
    {{~#if definition.cloze}}{{definition.cloze.prefix}}{{/if~}}
{{/inline}}

{{#*inline "cloze-body"}}
    {{~#if definition.cloze}}{{definition.cloze.body}}{{/if~}}
{{/inline}}

{{#*inline "cloze-suffix"}}
    {{~#if definition.cloze}}{{definition.cloze.suffix}}{{/if~}}
{{/inline}}

{{#*inline "tags"}}
    {{~#each definition.tags}}{{name}}{{#unless @last}}, {{/unless}}{{/each~}}
{{/inline}}

{{#*inline "url"}}
    <a href="{{definition.url}}">{{definition.url}}</a>
{{/inline}}

{{~> (lookup . "marker") ~}}
`.trim();
}

function optionsSetDefaults(options) {
    const defaults = {
        general: {
            enable: true,
            audioSource: 'jpod101',
            audioVolume: 100,
            resultOutputMode: 'group',
            debugInfo: false,
            maxResults: 32,
            showAdvanced: false,
            popupWidth: 400,
            popupHeight: 250,
            popupOffset: 10,
            showGuide: true,
            compactTags: false,
            tagLineBreak: false,
            compactGlossaries: false
        },

        scanning: {
            middleMouse: true,
            selectText: true,
            alphanumeric: true,
            autoHideResults: false,
            delay: 20,
            length: 10,
            modifier: 'shift'
        },

        dictionaries: {},

        anki: {
            enable: false,
            server: 'http://127.0.0.1:8765',
            tags: ['yomichan'],
            sentenceExt: 200,
            terms: {deck: '', model: '', fields: {}},
            kanji: {deck: '', model: '', fields: {}},
            fieldTemplates: optionsFieldTemplates()
        }
    };

    const combine = (target, source) => {
        for (const key in source) {
            if (!target.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    };

    combine(options, defaults);
    combine(options.general, defaults.general);
    combine(options.scanning, defaults.scanning);
    combine(options.anki, defaults.anki);
    combine(options.anki.terms, defaults.anki.terms);
    combine(options.anki.kanji, defaults.anki.kanji);

    return options;
}

function optionsVersion(options) {
    const fixups = [
        () => {},
        () => {},
        () => {},
        () => {},
        () => {
            if (options.general.audioPlayback) {
                options.general.audioSource = 'jpod101';
            } else {
                options.general.audioSource = 'disabled';
            }
        },
        () => {
            options.general.showGuide = false;
        },
        () => {
            if (options.scanning.requireShift) {
                options.scanning.modifier = 'shift';
            } else {
                options.scanning.modifier = 'none';
            }
        },
        () => {
            if (options.general.groupResults) {
                options.general.resultOutputMode = 'group';
            } else {
                options.general.resultOutputMode = 'split';
            }
            options.general.compactTags = false;
            options.general.tagLineBreak = true;
            options.general.compactGlossaries = false;
        }
    ];

    optionsSetDefaults(options);
    if (!options.hasOwnProperty('version')) {
        options.version = fixups.length;
    }

    while (options.version < fixups.length) {
        fixups[options.version++]();
    }

    return options;
}

function optionsLoad() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, store => resolve(store.options));
    }).then(optionsStr => {
        return optionsStr ? JSON.parse(optionsStr) : {};
    }).catch(error => {
        return {};
    }).then(options => {
        return optionsVersion(options);
    });
}

function optionsSave(options) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({options: JSON.stringify(options)}, resolve);
    }).then(() => {
        apiOptionsSet(options);
    });
}
