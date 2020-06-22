import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';
import classNames from 'classnames';
import ClipLoader from 'react-spinners/ClipLoader';

import { useFormatMessage, useFormatDate } from 'hooks';
import Table from 'components/Table';
import { fetchUsers, deleteUser, clearUsersData } from 'state/actions/users';
import paths from 'pages/Router/paths';
import ConfirmationModal from 'components/ConfirmationModal';
import classes from './Users.module.scss';

const Users = () => {
  const { usersList, isAdmin, error, loading, deleted } = useSelector(
    state => ({
      usersList: state.users.data,
      isAdmin: state.auth.userData.isAdmin,
      error: state.users.error,
      loading: state.users.loading,
      deleted: state.users.deleted
    }),
    shallowEqual
  );

  const [deleteModal, setDeleteModal] = useState({
    userId: null,
    isOpen: false
  });

  const dispatch = useDispatch();

  const [search, setSearch] = useState();

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsers());
    }

    return () => dispatch(clearUsersData());
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (deleted && !loading) {
      setDeleteModal(prevState => ({
        userId: null,
        isOpen: !prevState.isOpen
      }));
    }
  }, [deleted, loading]);

  const redirect = !isAdmin && <Redirect to={paths.ROOT} />;

  const onRemoveButtonClickHandler = userId => {
    setDeleteModal(prevState => ({
      userId,
      isOpen: !prevState.isOpen
    }));
  };

  const onCloseModalHandler = () => {
    setDeleteModal({ userId: null, isOpen: false });
  };

  const onDeleteUserHandler = () => {
    dispatch(deleteUser(deleteModal.userId));
  };

  const columns = [
    
    {
      Header: useFormatMessage('Users.date'),
      accessor: 'date',
      Cell: ({ row }) => (
        <small className="has-text-grey is-abbr-like">
          {useFormatDate(row.original.createdAt, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </small>
      )
    },
    {
      Header: useFormatMessage('Users.name'),
      accessor: 'name'
    },
    {
      Header: useFormatMessage('Users.qaDaily'),
      accessor: 'qaAmount'
    },
    {
      Header: useFormatMessage('Users.zoomDaily'),
      accessor: 'zoomAmount'
    }
  ];

  const data = search
    ? usersList.filter(el => {
        const clonedElem = { ...el };
        delete clonedElem.id;
        delete clonedElem.isAdmin;
        return Object.values(clonedElem).some(field =>
          field.toLowerCase().includes(search.toLowerCase())
        );
      })
    : usersList;

  const deleteMessage = useFormatMessage('Users.delete');

  const confirmMessage = useFormatMessage('Users.confirm');

  const permDeleteMessage = useFormatMessage('Users.permDelete');

  const cancelMessage = useFormatMessage('Users.cancel');

  return (
    <>
      {redirect}
      {deleteModal.isOpen && (
        <ConfirmationModal
          isActive={deleteModal.isOpen}
          isLoading={loading}
          confirmButtonMessage={deleteMessage}
          title={confirmMessage}
          body={permDeleteMessage}
          cancelButtonMessage={cancelMessage}
          onConfirmation={onDeleteUserHandler}
          onCancel={onCloseModalHandler}
        />
      )}
      <section className="hero is-hero-bar">
        <div className="hero-body">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h1 className="title">{useFormatMessage('Users.users')}</h1>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <Link to={paths.ADD_USER} className="button">
                  {useFormatMessage('Users.newUser')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section is-main-section">
        <div className="card has-table has-mobile-sort-spaced">
          <header className="card-header">
            <p className={classNames('card-header-title', classes.tableHeader)}>
              <span>{useFormatMessage('Users.search')}</span>
              <input
                type="text"
                className="input"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </p>
          </header>
          <div className="b-table">
            {loading ? <ClipLoader /> : <Table columns={columns} data={data} />}
            {error && 'Show error'}
          </div>
        </div>
      </section>
    </>
  );
};

export default Users;
