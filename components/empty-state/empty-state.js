// components/empty-state/empty-state.js
Component({
    properties: {
        icon: { type: String, value: '📭' },
        text: { type: String, value: '暂无数据' },
        subText: { type: String, value: '' },
        btnText: { type: String, value: '' }
    },
    methods: {
        onAction() { this.triggerEvent('action') }
    }
})
