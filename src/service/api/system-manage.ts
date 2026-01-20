import { request } from '../request';

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

/**
 * get all roles
 *
 * these roles are all enabled
 */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/systemManage/getAllRoles',
    method: 'get'
  });
}

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/systemManage/getUserList',
    method: 'get',
    params
  });
}

/** get menu list */
export function fetchGetMenuList(params?: Api.SystemManage.CommonSearchParams) {
  return request<Api.SystemManage.MenuList>({
    url: '/systemManage/getMenuList/v2',
    method: 'get',
    params
  });
}

/** get all pages */
export function fetchGetAllPages() {
  return request<string[]>({
    url: '/systemManage/getAllPages',
    method: 'get'
  });
}

/** get menu tree */
export function fetchGetMenuTree() {
  return request<Api.SystemManage.MenuTree[]>({
    url: '/systemManage/getMenuTree',
    method: 'get'
  });
}

/** add user */
export function fetchAddUser(data: Api.SystemManage.User) {
  return request<null>({
    url: '/systemManage/addUser',
    method: 'post',
    data
  });
}

/** update user */
export function fetchUpdateUser(data: Api.SystemManage.User) {
  return request<null>({
    url: '/systemManage/updateUser',
    method: 'post',
    data
  });
}

/** delete user */
export function fetchDeleteUser(id: number) {
  return request<null>({
    url: '/systemManage/deleteUser',
    method: 'delete',
    data: { id }
  });
}

/** batch delete users */
export function fetchBatchDeleteUser(ids: number[]) {
  return request<null>({
    url: '/systemManage/batchDeleteUser',
    method: 'delete',
    data: { ids }
  });
}
