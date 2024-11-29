import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/KanbanBoard.css';

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState('status');
  const [sort, setSort] = useState('priority');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        setTickets(response.data.tickets);
        setUsers(response.data.users);
      } catch (error) {
        console.log('Error fetching the data:', error);
      }
    };

    fetchData();
  }, []);

  const groupTickets = (tickets, grouping) => {
    const grouped = {};

    if (grouping === 'user') {
      users.forEach((user) => {
        grouped[user.id] = tickets.filter(ticket => ticket.userId === user.id);
      });
    } else if (grouping === 'priority') {
      tickets.forEach((ticket) => {
        grouped[ticket.priority] = grouped[ticket.priority] || [];
        grouped[ticket.priority].push(ticket);
      });
    } else {
      tickets.forEach((ticket) => {
        grouped[ticket.status] = grouped[ticket.status] || [];
        grouped[ticket.status].push(ticket);
      });
    }

    return grouped;
  };

  const sortTickets = (tickets, sortBy) => {
    return tickets.sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority;
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };

  const groupedTickets = groupTickets(tickets, grouping);
  const sortedGroupedTickets = Object.keys(groupedTickets).reduce((acc, group) => {
    acc[group] = sortTickets(groupedTickets[group], sort);
    return acc;
  }, {});

  return (
    <div className="kanban-board">
      <div className="controls">
        <select className="grouping-dropdown" value={grouping} onChange={(e) => setGrouping(e.target.value)}>
          <option value="status">Group by Status</option>
          <option value="user">Group by User</option>
          <option value="priority">Group by Priority</option>
        </select>

        <select className="sorting-dropdown" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="priority">Sort by Priority</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>

      <div className="kanban-columns">
        {Object.keys(sortedGroupedTickets).map((group, index) => {
          const ticketsInGroup = sortedGroupedTickets[group];

          return (
            <div key={index} className="kanban-column">
              <div className="kanban-column-header">
                {grouping === 'user' ? (
                  users.find((user) => user.id === group)?.name || 'Unknown User'
                ) : (
                  group
                )}
              </div>

              {ticketsInGroup.length > 0 ? (
                ticketsInGroup.map((ticket) => (
                  <div key={ticket.id} className="ticket-card">
                    <div className="ticket-title">{ticket.title}</div>
                    <div className="ticket-info">Priority: {ticket.priority}</div>
                    <div className="ticket-info">Status: {ticket.status}</div>
                    <div className="ticket-info">
                      User: {users.find((user) => user.id === ticket.userId)?.name || 'No user assigned'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-tickets">No tickets available</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
