import * as React from "react";
import { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import axios from "axios";

export default function CheckboxSelectionGrid() {
  const [apiData, setApiData] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingCell, setEditingCell] = React.useState(null);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [searchText, setSearchText] = React.useState("");

  const rowsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json",
        );
        const data = response.data;

        // Sort users by the `id` field
        const sortedUsers = data.sort(
          (a, b) => parseInt(a.id) - parseInt(b.id),
        );

        // Update the state with the fetched and sorted data
        setApiData(sortedUsers);
        console.log("Data fetched successfully!");
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (id) => {
    // Set the cell in edit mode for the clicked row
    setEditingCell(id);
  };

  const handleDeleteClick = (id) => {
    // Handle delete logic here, remove the row with the given ID from the state
    const updatedData = apiData.filter((row) => row.id !== id);
    setApiData(updatedData);
    console.log(`Row with ID ${id} deleted in memory`);
  };

  const handleBulkDelete = () => {
    // Handle bulk delete logic here
    const updatedData = apiData.filter((row) => !selectedRows.includes(row.id));
    setApiData(updatedData);

    setSelectedRows([]); // Clear selected rows

    console.log("All selected rows deleted in memory");
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleEditCellChange = (editCell) => {
    // Update the state with the edited cell value
    const updatedData = apiData.map((row) =>
      row.id === editingCell
        ? { ...row, [editCell.field]: editCell.props.value }
        : row,
    );
    setApiData(updatedData);
  };

  const totalPages = Math.ceil(apiData.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const displayedRows = apiData
    .filter(
      (row) =>
        row.name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.email.toLowerCase().includes(searchText.toLowerCase()) ||
        row.role.toLowerCase().includes(searchText.toLowerCase()),
    )
    .slice(startIdx, endIdx);

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1, editable: true },
    { field: "email", headerName: "Email", flex: 1, editable: true },
    { field: "role", headerName: "Role", flex: 1, editable: true },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 200,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleEditClick(params.row.id)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteClick(params.row.id)}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container>
      <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px" }}>
        <Typography variant="h5" component="div" gutterBottom>
          User Management
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              fullWidth
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} style={{ textAlign: "right" }}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              // disabled={selectedRows.length === 0}
            >
              Delete All Selected
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={3} style={{ padding: "20px", height: "650px" }}>
        <DataGrid
          checkboxSelection
          rows={displayedRows}
          columns={columns}
          pageSize={rowsPerPage}
          autoPageSize
          onEditCellChange={handleEditCellChange}
          onSelectionChange={(rows) => setSelectedRows(rows)}
          actions={[
            {
              icon: "delete",
              tooltip: "Delete all selected rows",
              onClick: () => handleBulkDelete(),
            },
          ]}
          isCellEditable={(params) =>
            params.id === editingCell && params.field !== "id"
          }
        />
      </Paper>
      <Stack
        spacing={2}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Stack>
    </Container>
  );
}
