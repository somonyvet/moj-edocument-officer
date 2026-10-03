export const PERMISSION_MY_FILE = {
    read: { key: 'read_my_files', name: 'View' },
    create: { key: 'create', name: 'Upload/Create' },
    get_link: { key: 'get_link', name: 'Share link' },
    // Invite_user:{ key: 'Invite_user', name: 'Invite people' },
    // remove_Invite_user:{ key: 'remove_Invite_user', name: 'Remove people' },
    // move:{ key: 'move', name: 'Move' },
    // download:{ key: 'download', name: 'Download' },
    update: { key: 'update', name: 'Update' },
    delete: { key: 'delete', name: 'Delete' },
}

export const PERMISSION_USER = {
    read: { key: 'read_user', name: 'View' },
    create_user: { key: 'create_user', name: 'Create' },
    update_user: { key: 'update_user', name: 'Update' },
    delete_user: { key: 'delete_user', name: 'Delete' },
    reset_user_password: { key: 'reset_user_password', name: 'Reset Password' },
    // view_permission:{ key: 'view_permission', name: 'View Permission' },
    // set_permission:{ key: 'set_permission', name: 'Set Permission' },
    // user_info:{ key: 'user_info', name: 'User Info' },
    user_permission: { key: 'user_permission', name: 'User Permission' },
}

export const PERMISSION_GROUP_USER = {
    read: { key: 'read_group_user', name: 'View' },
    add_member: { key: 'add_member', name: 'Add Member' },
    remove_member: { key: 'remove_member', name: 'Remove Member' },
    view_member: { key: 'view_member', name: 'View Member' },
    create_group: { key: 'create_group', name: 'Create' },
    update_group: { key: 'update_group', name: 'Update' },
    delete_group: { key: 'delete_group', name: 'Delete' },
    // view_group_permission:{ key: 'view_group_permission', name: 'View Group Permission' },
    // set_group_permission:{ key: 'set_group_permission', name: 'Set Group Permission' },
    group_info: { key: 'group_info', name: 'Group Info' },
    group_permission: { key: 'group_permission', name: 'Group Permission' },
}

export const PERMISSION_COMPANY = {
    read: { key: 'read_company', name: 'View' },
    create_company: { key: 'create_company', name: 'Create' },
    update_company: { key: 'update_company', name: 'Update' },
    delete_company: { key: 'delete_company', name: 'Delete' },
}
export const PERMISSION_TAG = {
    read: { key: 'read_tag', name: 'View' },
    create_tag: { key: 'create_tag', name: 'Create' },
    update_tag: { key: 'update_tag', name: 'Update' },
    delete_tag: { key: 'delete_tag', name: 'Delete' },
}

export const PERMISSION: any[] = [
    {
        key: 'my_files',
        name: 'បណ្ណសារដ្ឋាន',
        name_en: 'My Files',
        tasks: [
            { key: 'read_my_files', name: 'View' },
            { key: 'create', name: 'Upload/Create' },
            { key: 'get_link', name: 'Share link' },
            // { key: 'Invite_user', name: 'Invite people' },
            // { key: 'remove_Invite_user', name: 'Remove people' },
            { key: 'move', name: 'Move' },
            // { key: 'download', name: 'Download' },
            { key: 'update', name: 'Update' },
            { key: 'delete', name: 'Delete' },
        ]
    },
    {
        key: 'user',
        name: 'User',
        tasks: [
            { key: 'read_user', name: 'View' },
            { key: 'create_user', name: 'Create' },
            { key: 'update_user', name: 'Update' },
            { key: 'delete_user', name: 'Delete' },
            { key: 'reset_user_password', name: 'Reset Password' },
            // { key: 'view_permission', name: 'View Permission' },
            // { key: 'set_permission', name: 'Set Permission' },
            // { key: 'user_info', name: 'User Info' },
            { key: 'user_permission', name: 'User Permission' },

        ]
    },
    {
        key: 'group_user',
        name: 'Group User',
        tasks: [
            { key: 'read_group_user', name: 'View' },
            { key: 'create_group', name: 'Create' },
            { key: 'update_group', name: 'Update' },
            { key: 'delete_group', name: 'Delete' },
            { key: 'group_info', name: 'Group Info' },
            { key: 'view_member', name: 'View Member' },
            { key: 'add_member', name: 'Add Member' },
            { key: 'remove_member', name: 'Remove Member' },
            // { key: 'view_group_permission', name: 'View Group Permission' },
            // { key: 'set_group_permission', name: 'Set Group Permission' },
            { key: 'group_permission', name: 'Group Permission' },
        ]
    },
    {
        key: 'company',
        name: 'Company',
        tasks: [
            { key: 'read_company', name: 'View' },
            { key: 'create_company', name: 'Create' },
            { key: 'update_company', name: 'Update' },
            { key: 'delete_company', name: 'Delete' },
        ]
    },
    {
        key: 'tag',
        name: 'Tag',
        tasks: [
            { key: 'read_tag', name: 'View' },
            { key: 'create_tag', name: 'Create' },
            { key: 'update_tag', name: 'Update' },
            { key: 'delete_tag', name: 'Delete' },
        ]
    },
]