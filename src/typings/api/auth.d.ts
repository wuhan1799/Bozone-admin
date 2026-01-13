declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
      avatar?: string;
      nickName?: string;
      realName?: string;
      userGender?: number;
      userPhone?: string;
      userEmail?: string;
      deptId?: string;
      deptName?: string;
      status?: number;
      createdAt?: string;
    }
  }
}
