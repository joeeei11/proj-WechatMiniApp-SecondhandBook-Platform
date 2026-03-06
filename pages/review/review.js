// pages/review/review.js - 发表评价
const { reviewAPI, userAPI } = require('../../utils/api')

Page({
    data: {
        orderId: '',
        revieweeId: '',
        revieweeInfo: null,
        score: 5,
        content: '',
        submitting: false
    },

    async onLoad(options) {
        const { orderId, revieweeId } = options
        this.setData({ orderId, revieweeId })

        // 加载被评价者信息
        try {
            const revieweeInfo = await userAPI.getUserInfo(revieweeId)
            this.setData({ revieweeInfo })
        } catch (e) { }
    },

    setScore(e) {
        this.setData({ score: e.currentTarget.dataset.score })
    },

    onContentInput(e) {
        this.setData({ content: e.detail.value })
    },

    async submitReview() {
        const { orderId, revieweeId, score, content } = this.data
        if (!content.trim()) {
            wx.showToast({ title: '请输入评价内容', icon: 'none' })
            return
        }

        this.setData({ submitting: true })
        wx.showLoading({ title: '提交中...' })

        try {
            await reviewAPI.submitReview({ orderId, revieweeId, score, content: content.trim() })
            wx.showToast({ title: '评价成功！' })
            setTimeout(() => wx.navigateBack(), 1500)
        } catch (err) {
            console.error('评价失败:', err)
            wx.showToast({ title: '提交失败', icon: 'error' })
        } finally {
            wx.hideLoading()
            this.setData({ submitting: false })
        }
    }
})
