// pages/chat/chat.js - 聊天页面
const { messageAPI, bookAPI, userAPI } = require('../../utils/api')

Page({
    data: {
        otherUserId: '',
        bookId: '',
        bookInfo: null,
        messages: [],
        myId: '',
        myInfo: null,
        otherUser: null,
        inputMsg: '',
        scrollToId: 'msg-bottom'
    },

    async onLoad(options) {
        const { userId, bookId, bookTitle } = options
        const app = getApp()

        if (!app.globalData.openid) {
            wx.showToast({ title: '请先登录', icon: 'none' })
            wx.navigateBack()
            return
        }

        this.setData({ otherUserId: userId, bookId, myId: app.globalData.openid })

        wx.setNavigationBarTitle({ title: bookTitle || '聊天' })

        // 并行加载：对方信息、书籍信息、聊天记录
        const [otherUser, myInfo] = await Promise.all([
            userAPI.getUserInfo(userId),
            userAPI.getUserInfo(app.globalData.openid),
            this.loadMessages(),
            bookId ? this.loadBookInfo(bookId) : Promise.resolve()
        ])
        this.setData({ otherUser, myInfo })

        // 标记消息已读
        messageAPI.markAsRead(userId).catch(() => { })

        // 开始轮询（每3秒刷新一次消息）
        this.startPolling()
    },

    onUnload() {
        this.stopPolling()
    },

    startPolling() {
        this._pollingTimer = setInterval(() => {
            this.loadMessages()
        }, 3000)
    },

    stopPolling() {
        if (this._pollingTimer) {
            clearInterval(this._pollingTimer)
            this._pollingTimer = null
        }
    },

    async loadMessages() {
        const messages = await messageAPI.getChatHistory(this.data.otherUserId)
        // 仅有新消息时才更新，避免频繁 setData 导致闪烁
        if (messages.length !== this.data.messages.length) {
            this.setData({ messages, scrollToId: 'msg-bottom' })
        }
    },

    async loadBookInfo(bookId) {
        const bookInfo = await bookAPI.getBookDetail(bookId)
        this.setData({ bookInfo })
    },

    onMsgInput(e) {
        this.setData({ inputMsg: e.detail.value })
    },

    async sendMessage() {
        const content = this.data.inputMsg.trim()
        if (!content) return

        this.setData({ inputMsg: '' })
        try {
            await messageAPI.sendMessage(this.data.otherUserId, content, this.data.bookId)
            await this.loadMessages()
        } catch (e) {
            wx.showToast({ title: '发送失败', icon: 'error' })
            this.setData({ inputMsg: content })
        }
    },

    goBookDetail() {
        if (this.data.bookId) {
            wx.navigateTo({ url: `/pages/book-detail/book-detail?id=${this.data.bookId}` })
        }
    }
})
