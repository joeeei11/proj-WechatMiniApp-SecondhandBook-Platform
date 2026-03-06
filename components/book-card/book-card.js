// components/book-card/book-card.js
Component({
    properties: {
        book: { type: Object, value: {} },
        showStatus: { type: Boolean, value: false }
    },
    data: {
        conditionMap: {
            'new': '全新', '10': '十成新',
            '9': '九成新', '8': '八成新', '7': '七成及以下'
        },
        statusMap: {
            'on_sale': { text: '在售', color: '#67C23A' },
            'sold': { text: '已售', color: '#999' },
            'withdrawn': { text: '已下架', color: '#F56C6C' }
        }
    },
    methods: {
        onTap() {
            this.triggerEvent('tap', { id: this.data.book._id })
        }
    }
})
