var Tagger = (function() {
    'use strict';

    // ── Country detection ──
    // Common IPTV country prefixes (before colon or pipe)
    var COUNTRY_MAP = {
        'SE': 'Sweden', 'SWE': 'Sweden', 'SWEDEN': 'Sweden',
        'NO': 'Norway', 'NOR': 'Norway', 'NORWAY': 'Norway',
        'DK': 'Denmark', 'DEN': 'Denmark', 'DENMARK': 'Denmark',
        'FI': 'Finland', 'FIN': 'Finland', 'FINLAND': 'Finland',
        'UK': 'United Kingdom', 'GB': 'United Kingdom', 'GBR': 'United Kingdom',
        'US': 'United States', 'USA': 'United States',
        'DE': 'Germany', 'GER': 'Germany', 'GERMANY': 'Germany',
        'FR': 'France', 'FRA': 'France', 'FRANCE': 'France',
        'ES': 'Spain', 'SPA': 'Spain', 'SPAIN': 'Spain',
        'IT': 'Italy', 'ITA': 'Italy', 'ITALY': 'Italy',
        'NL': 'Netherlands', 'NED': 'Netherlands', 'NETHERLANDS': 'Netherlands',
        'PT': 'Portugal', 'POR': 'Portugal', 'PORTUGAL': 'Portugal',
        'PL': 'Poland', 'POL': 'Poland', 'POLAND': 'Poland',
        'TR': 'Turkey', 'TUR': 'Turkey', 'TURKEY': 'Turkey',
        'RU': 'Russia', 'RUS': 'Russia', 'RUSSIA': 'Russia',
        'AR': 'Arabic', 'ARAB': 'Arabic', 'ARABIC': 'Arabic',
        'IN': 'India', 'IND': 'India', 'INDIA': 'India',
        'PK': 'Pakistan', 'PAK': 'Pakistan',
        'CA': 'Canada', 'CAN': 'Canada', 'CANADA': 'Canada',
        'AU': 'Australia', 'AUS': 'Australia', 'AUSTRALIA': 'Australia',
        'BR': 'Brazil', 'BRA': 'Brazil', 'BRAZIL': 'Brazil',
        'MX': 'Mexico', 'MEX': 'Mexico', 'MEXICO': 'Mexico',
        'RO': 'Romania', 'ROM': 'Romania', 'ROMANIA': 'Romania',
        'GR': 'Greece', 'GRE': 'Greece', 'GREECE': 'Greece',
        'BG': 'Bulgaria', 'BUL': 'Bulgaria',
        'HR': 'Croatia', 'CRO': 'Croatia',
        'RS': 'Serbia', 'SRB': 'Serbia',
        'BA': 'Bosnia', 'BIH': 'Bosnia',
        'AL': 'Albania', 'ALB': 'Albania',
        'CZ': 'Czech Republic', 'CZE': 'Czech Republic',
        'HU': 'Hungary', 'HUN': 'Hungary',
        'AT': 'Austria', 'AUT': 'Austria',
        'CH': 'Switzerland', 'SUI': 'Switzerland',
        'BE': 'Belgium', 'BEL': 'Belgium',
        'IE': 'Ireland', 'IRL': 'Ireland',
        'IL': 'Israel', 'ISR': 'Israel',
        'AF': 'Afghanistan', 'AFG': 'Afghanistan',
        'KR': 'South Korea', 'KOR': 'South Korea',
        'JP': 'Japan', 'JPN': 'Japan',
        'CN': 'China', 'CHN': 'China',
        'TH': 'Thailand', 'THA': 'Thailand',
        'PH': 'Philippines', 'PHI': 'Philippines',
        'MY': 'Malaysia', 'MYS': 'Malaysia',
        'ID': 'Indonesia', 'IDN': 'Indonesia',
        'EX': 'Ex-Yu', 'EX-YU': 'Ex-Yu', 'EXYU': 'Ex-Yu',
        'NORDIC': 'Nordic', 'SCANDINAVIA': 'Nordic'
    };

    // ── Quality tags ──
    var QUALITY_PATTERNS = [
        { pattern: /\b4K\b/i, tag: '4K' },
        { pattern: /\bUHD\b/i, tag: '4K' },
        { pattern: /\bFHD\b/i, tag: 'FHD' },
        { pattern: /\b1080[pi]?\b/i, tag: 'FHD' },
        { pattern: /\bHD\b/i, tag: 'HD' },
        { pattern: /\b720[pi]?\b/i, tag: 'HD' },
        { pattern: /\bSD\b/i, tag: 'SD' },
        { pattern: /\bHEVC\b/i, tag: 'HEVC' },
        { pattern: /\bH\.?265\b/i, tag: 'HEVC' }
    ];

    // ── Content type keywords ──
    var TYPE_KEYWORDS = {
        'Sport': ['sport', 'sports', 'espn', 'eurosport', 'bein', 'dazn', 'sky sport',
                  'fox sport', 'bt sport', 'premier league', 'liga', 'nfl', 'nba', 'nhl',
                  'mlb', 'ufc', 'boxing', 'tennis', 'golf', 'cricket', 'rugby',
                  'football', 'soccer', 'motorsport', 'f1', 'formula', 'olympic',
                  'viaplay sport', 'cmore sport', 'tv4 sport', 'sport1', 'sport2'],
        'News': ['news', 'cnn', 'bbc news', 'al jazeera', 'sky news', 'fox news',
                 'msnbc', 'cnbc', 'bloomberg', 'rt news', 'france 24', 'dw news',
                 'euronews', 'nyheter', 'aktuellt', 'rapport'],
        'Kids': ['kids', 'children', 'disney', 'nickelodeon', 'nick', 'cartoon',
                 'baby', 'junior', 'boomerang', 'pbs kids', 'cbbc', 'cbeebies',
                 'nick jr', 'disney jr', 'disney junior', 'barnkanalen', 'bolibompa'],
        'Movies': ['movie', 'movies', 'film', 'cinema', 'hbo', 'showtime', 'starz',
                   'amc', 'tcm', 'cinemax', 'paramount', 'sf', 'viaplay film',
                   'cmore film', 'filmnet'],
        'Series': ['series', 'drama', 'netflix', 'hulu', 'amazon', 'apple tv'],
        'Music': ['music', 'mtv', 'vh1', 'vevo', 'cmtv', 'trace', 'mezzo',
                  'stingray', 'deluxe music'],
        'Documentary': ['documentary', 'doc', 'discovery', 'national geographic',
                       'nat geo', 'history', 'animal planet', 'bbc earth',
                       'smithsonian', 'curiosity', 'investigation', 'crime'],
        'Entertainment': ['entertainment', 'comedy', 'reality', 'tlc', 'e!',
                         'bravo', 'lifetime', 'food', 'travel', 'hgtv'],
        'Adult': ['adult', 'xxx', '18+', 'playboy', 'hustler', 'penthouse']
    };

    // ── Tag extraction ──

    function extractCountry(name, groupName) {
        // Try from channel name first (e.g. "SE: SVT1 HD" or "SE | SVT1")
        var prefixMatch = name.match(/^([A-Za-z\-]{2,12})\s*[:|\/|\\|\-]\s*/);
        if (prefixMatch) {
            var prefix = prefixMatch[1].toUpperCase().replace(/-/g, '');
            if (COUNTRY_MAP[prefix]) return COUNTRY_MAP[prefix];
        }

        // Try from group name (e.g. "Sweden", "SE Live", "UK Entertainment")
        var groupUpper = groupName.toUpperCase();
        // Check full group name first
        for (var code in COUNTRY_MAP) {
            if (COUNTRY_MAP.hasOwnProperty(code)) {
                // Match country code or name at start of group
                var country = COUNTRY_MAP[code];
                if (groupUpper === code ||
                    groupUpper === country.toUpperCase() ||
                    groupUpper.indexOf(code + ' ') === 0 ||
                    groupUpper.indexOf(country.toUpperCase() + ' ') === 0 ||
                    groupUpper.indexOf(code + ':') === 0) {
                    return country;
                }
            }
        }

        return null;
    }

    function extractQuality(name) {
        for (var i = 0; i < QUALITY_PATTERNS.length; i++) {
            if (QUALITY_PATTERNS[i].pattern.test(name)) {
                return QUALITY_PATTERNS[i].tag;
            }
        }
        return null;
    }

    function extractTypes(name, groupName) {
        var types = [];
        var combined = (name + ' ' + groupName).toLowerCase();

        for (var type in TYPE_KEYWORDS) {
            if (TYPE_KEYWORDS.hasOwnProperty(type)) {
                var keywords = TYPE_KEYWORDS[type];
                for (var i = 0; i < keywords.length; i++) {
                    if (combined.indexOf(keywords[i]) !== -1) {
                        types.push(type);
                        break; // One match per type is enough
                    }
                }
            }
        }

        return types;
    }

    // ── Language from category prefix ──
    var LANG_MAP = {
        'SE': 'Swedish', 'SWE': 'Swedish', 'SWEDEN': 'Swedish',
        'UK': 'English', 'GB': 'English', 'US': 'English', 'USA': 'English',
        'ES': 'Spanish', 'SPA': 'Spanish', 'SPAIN': 'Spanish',
        'FR': 'French', 'FRA': 'French',
        'DE': 'German', 'GER': 'German',
        'IT': 'Italian', 'ITA': 'Italian',
        'PT': 'Portuguese', 'POR': 'Portuguese',
        'NL': 'Dutch', 'NED': 'Dutch',
        'NO': 'Norwegian', 'NOR': 'Norwegian',
        'DK': 'Danish', 'DEN': 'Danish',
        'FI': 'Finnish', 'FIN': 'Finnish'
    };

    function extractLanguage(groupName) {
        if (!groupName) return null;
        // Match prefix before delimiter: "SE | Viaplay" → "SE"
        var m = groupName.match(/^([A-Za-z]{2,6})\s*[|:\-\/]/);
        if (m) {
            var code = m[1].toUpperCase();
            if (LANG_MAP[code]) return LANG_MAP[code];
        }
        // Also check if group starts with a known code followed by space
        var parts = groupName.toUpperCase().split(/\s+/);
        if (parts[0] && LANG_MAP[parts[0]]) return LANG_MAP[parts[0]];
        return null;
    }

    // ── Main tagging function ──
    // Adds .tags object to each channel: { country, quality, types[], language }
    function tagChannels(channels) {
        for (var i = 0; i < channels.length; i++) {
            var ch = channels[i];
            ch.tags = {
                country: extractCountry(ch.name, ch.group || ''),
                quality: extractQuality(ch.name),
                types: extractTypes(ch.name, ch.group || ''),
                language: extractLanguage(ch.group || '')
            };
        }
        return channels;
    }

    // ── Build tag summary (for UI) ──
    // Returns { countries: [{name, count}], qualities: [...], types: [...] }
    function buildTagSummary(channels) {
        var countryCounts = {};
        var qualityCounts = {};
        var typeCounts = {};

        for (var i = 0; i < channels.length; i++) {
            var t = channels[i].tags;
            if (!t) continue;

            if (t.country) {
                countryCounts[t.country] = (countryCounts[t.country] || 0) + 1;
            }
            if (t.quality) {
                qualityCounts[t.quality] = (qualityCounts[t.quality] || 0) + 1;
            }
            for (var j = 0; j < t.types.length; j++) {
                typeCounts[t.types[j]] = (typeCounts[t.types[j]] || 0) + 1;
            }
        }

        return {
            countries: toSortedArray(countryCounts),
            qualities: toSortedArray(qualityCounts),
            types: toSortedArray(typeCounts)
        };
    }

    function toSortedArray(obj) {
        var arr = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push({ name: key, count: obj[key] });
            }
        }
        arr.sort(function(a, b) { return b.count - a.count; });
        return arr;
    }

    // ── Filter by tag ──
    function filterByTag(channels, tagType, tagValue) {
        return channels.filter(function(ch) {
            if (!ch.tags) return false;
            if (tagType === 'country') return ch.tags.country === tagValue;
            if (tagType === 'quality') return ch.tags.quality === tagValue;
            if (tagType === 'type') return ch.tags.types.indexOf(tagValue) !== -1;
            return false;
        });
    }

    return {
        tagChannels: tagChannels,
        buildTagSummary: buildTagSummary,
        filterByTag: filterByTag,
        extractCountry: extractCountry,
        extractQuality: extractQuality,
        extractTypes: extractTypes,
        extractLanguage: extractLanguage
    };
})();
