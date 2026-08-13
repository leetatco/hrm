<template>
  <view class="content1">
    <view class="imgv">
      <image class="logo-img" src="@/static/img/icon_@3x.png"></image>
    </view>

    <view class="input-group">
      <view class="input-row border">
        <m-input
          type="text"
          focus
          clearable
          v-model="username"
          placeholder="请输入账号"
        ></m-input>
      </view>
      <view class="input-row border">
        <m-input
          type="text"
          focus
          clearable
          v-model="nickname"
          placeholder="请输入昵称"
        ></m-input>
      </view>
      <view class="input-row border">
        <m-input
          type="password"
          displayable
          v-model="password"
          placeholder="请输入密码"
        ></m-input>
      </view>
      <view class="input-row border">
        <m-input
          type="password"
          displayable
          v-model="confirmPassword"
          placeholder="重复一次密码"
        ></m-input>
      </view>
    </view>
    <view class="btn-row">
      <button type="primary" class="primary" @tap="register">注册</button>
    </view>
  </view>
</template>

<script>
import mInput from "../../components/m-input.vue";

export default {
  components: {
    mInput,
  },
  data() {
    return {
      avatar:
        "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-0f215899-37db-41b7-8231-51232da1a1a3/bd1928fe-1841-4ce6-9827-66c7d8113431.png",
      username: "",
      password: "",
      nickname: "",
      confirmPassword: "",
    };
  },
  methods: {
    register() {
      /**
       * 客户端对账号信息进行一些必要的校验。
       * 实际开发中，根据业务需要进行处理，这里仅做示例。
       */
      if (this.username.length < 3) {
        uni.showToast({
          icon: "none",
          title: "账号最短为 3 个字符",
        });
        return;
      }
      if (this.nickname.length < 1) {
        uni.showToast({
          icon: "none",
          title: "昵称不能为空",
        });
        return;
      }
      if (this.password.length < 6) {
        uni.showToast({
          icon: "none",
          title: "密码最短为 6 个字符",
        });
        return;
      }
      if (this.password !== this.confirmPassword) {
        uni.showToast({
          icon: "none",
          title: "两次密码输入不一致",
        });
        return;
      }

      const data = {
        username: this.username,
        password: this.password,
        nickname: this.nickname,
        role: ["user"],
        avatar: this.avatar,
        department_id: ["606e9f7080b8450001e80d81"],
      };
      uniCloud.callFunction({
        name: "user-center",
        data: {
          action: "register",
          params: data,
        },
        success(e) {
          if (e.result.code === 0) {
            uni.showToast({
              title: "注册成功",
            });
            setTimeout(function () {
              uni.reLaunch({
                url: "/pages/login/login",
              });
            }, 3000);
          } else {
            uni.showToast({
              title: e.result.message,
              icon: "none",
              duration: 2000,
            });
          }
        },
        fail(e) {
          uni.showModal({
            content: JSON.stringify(e.result.message),
            showCancel: false,
          });
        },
      });
    },
  },
};
</script>

<style>
.content1 {
  display: flex;
  flex: 1;
  flex-direction: column;
  background: #ffffff;
  width: 100%;
  overflow-x: hidden;
}

.imgv {
width: 100%;
	
		margin: 0 auto;
		display: flex;
		justify-self: center;
		align-items: center;
		margin: 80rpx 0 0 0 ;
}

.logo-img {
  width: 120rpx;
  height: 120rpx;
  display: inline-block;
  border-radius: 10px;
  	margin: 0 auto;
}

.input-group {
  background-color: #ffffff;
  	margin: 0 auto;
  margin-top: 70rpx;
  position: relative;
  width: 610rpx;

}

.input-group::before {
  position: absolute;
  right: 0;
  top: 0;
  left: 0;
  height: 1px;
  content: "";
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  background-color: #ffffff;
}

.input-group::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  content: "";
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  background-color: #fff;
}

.input-row {
  display: flex;
  flex-direction: row;
  position: relative;
  width: 610rpx;
  height: 51.5px;
  line-height: 40px;
}

.input-row.border::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0px;
  height: 1px;
  content: "";
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  background-color: #c8c7cc;
}

.btn-row {
  margin-top: 25px;
  border-radius: 4px;
}

button.primary {
  background: #3b88f5;
  width: 610rpx;
  height: 98rpx;
  color: #ffffff;
  font-family: PingFang SC;
  font-weight: 500;
  font-size: 15px;
  line-height: normal;
  letter-spacing: 0px;
  text-align: center;
  padding-top: 28rpx;
}

.primary:active {
  top: 2px;
  /**向下偏移2px **/
  background: #8f8f94;
}
</style>
