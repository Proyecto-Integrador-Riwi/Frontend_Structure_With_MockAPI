const Skeleton = {
    card() {
        const el = document.createElement("div");
        el.className = "bg-white rounded-xl border border-gray-100 overflow-hidden shimmer";
        el.innerHTML = `
            <div class="h-40 bg-gray-200/50"></div>
            <div class="p-5 space-y-3">
                <div class="h-4 bg-gray-200/50 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200/50 rounded w-1/4"></div>
                <div class="h-3 bg-gray-200/50 rounded w-full"></div>
                <div class="h-3 bg-gray-200/50 rounded w-2/3"></div>
            </div>
        `;
        return el;
    },

    statCard() {
        const el = document.createElement("div");
        el.className = "bg-white rounded-xl border border-gray-100 p-6 shimmer";
        el.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="space-y-2">
                    <div class="h-3 bg-gray-200/50 rounded w-20"></div>
                    <div class="h-8 bg-gray-200/50 rounded w-16"></div>
                </div>
                <div class="w-12 h-12 rounded-lg bg-gray-200/50"></div>
            </div>
        `;
        return el;
    },

    tableRow() {
        const el = document.createElement("div");
        el.className = "bg-white rounded-xl p-4 flex items-center gap-4 shimmer";
        el.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-gray-200/50 flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200/50 rounded w-48"></div>
                <div class="h-3 bg-gray-200/50 rounded w-32"></div>
            </div>
        `;
        return el;
    },

    textLine(width = "w-full") {
        const el = document.createElement("div");
        el.className = `h-3 bg-gray-200/50 rounded ${width} shimmer`;
        return el;
    },

    custom(html) {
        const el = document.createElement("div");
        el.innerHTML = html;
        return el;
    },

    grid(count = 6, type = "card") {
        const el = document.createElement("div");
        el.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5";
        for (let i = 0; i < count; i++) {
            el.appendChild(type === "stat" ? this.statCard() : (type === "table" ? this.tableRow() : this.card()));
        }
        return el;
    }
};

export default Skeleton;
