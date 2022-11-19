import React, { useEffect, useState } from "react";
import Highlighter from "react-highlight-words";
import { CSVLink } from "react-csv";

// Import Components
import {
  Button,
  Popconfirm,
  Space,
  Table,
  Typography,
  Form,
  Input,
  InputNumber,
} from "antd";

// Import Icons
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";

// Import Actions & Methods
import { getPosts, deletePost, updatePost } from "../redux/actions/postActions";
import { useDispatch, useSelector } from "react-redux";

// Import Constants
const { Title } = Typography;

// Table Styles
const TableStyle = {
  paddingLeft: 20,
  paddingRight: 20,
};

const DataTable = () => {
  const dispatch = useDispatch();
  // Table States
  const [dataSource, setDataSource] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});
  const [searchText, setSearchText] = useState("");
  let [filteredData] = useState([]);

  // Form States
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.key === editingKey;

  const [searchColText, setSearchColText] = useState("");
  const [searchedCol, setSearchedCol] = useState("");

  // Get Posts
  useEffect(() => {
    dispatch(getPosts());
  }, []);

  // Get Data From Redux Store
  const { posts, loading, isSuccess } = useSelector((state) => state.posts);

  // On Cancel
  const _onCancel = () => {
    setEditingKey("");
  };

  // On Save
  const _onSave = async (record) => {
    try {
      const row = await form.validateFields();
      // Handle Update
      dispatch(updatePost({ id: record.id, ...row }));
      if (isSuccess) {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => record.key === item.key);
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...row,
          });
          setDataSource(newData);
          setEditingKey("");
        } else {
          newData.push(row);
          setDataSource(newData);
          setEditingKey("");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // On Edit
  const _onEdit = (record) => {
    form.setFieldsValue({
      ...record,
      title: record.title,
      body: record.body,
      age: record.age,
    });
    setEditingKey(record.key);
  };

  // On Reset
  const _onReset = () => {
    setSortedInfo({});
    setSearchText("");
    _setTableData();
    console.log("reset");
  };

  // Handle Delete
  const _handleDelete = (record) => {
    dispatch(deletePost(record.id));
    if (isSuccess) {
      setDataSource(dataSource.filter((data) => data.id !== record.id));
    }
  };

  // Handle Change
  const _handleChange = (...sorter) => {
    const { order, field } = sorter[2];
    setSortedInfo({ columnKey: field, order });
  };

  // Handle Search
  const _handleSearchText = (e) => {
    setSearchText(e.target.value);
    if (e.target.value === "") {
      _setTableData();
    }
  };

  // Handle Global Search
  const _handleGlobalSearch = () => {
    filteredData = dataSource.filter((value) => {
      return (
        value.title.toLowerCase().includes(searchText.toLowerCase()) ||
        value.body.toLowerCase().includes(searchText.toLowerCase()) ||
        value.age.toString().includes(searchText)
      );
    });

    setDataSource(filteredData);
  };

  // Set Table Data With Key
  const _setTableData = () => {
    setDataSource([]);
    posts.forEach((post, index) => {
      setDataSource((prev) => [
        ...prev,
        {
          key: post.id,
          ID: index + 1,
          age: Math.floor(Math.random() * 99) + 1,
          ...post,
        },
      ]);
    });
  };

  // Set Table Data Source
  if (posts?.length > 0 && !isFetched) {
    _setTableData();
    setIsFetched(true);
  }

  // Get Column Search Props
  const _getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div
        style={{
          padding: 8,
        }}
      >
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            _handleSearchCol(selectedKeys, confirm, dataIndex)
          }
          style={{
            marginBottom: 8,
            display: "block",
          }}
        ></Input>
        <Space>
          <Button
            type="primary"
            onClick={() => _handleSearchCol(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() =>
              clearFilters && _handleResetCol(clearFilters, confirm)
            }
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    render: (text) =>
      searchedCol === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchColText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // Handle Search Column
  const _handleSearchCol = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchColText(selectedKeys[0]);
    setSearchedCol(dataIndex);
  };

  // Handle Reset Column Search
  const _handleResetCol = (clearFilters, confirm) => {
    clearFilters();
    setSearchColText("");
    confirm();
  };

  // Set Table Columns
  const columns = [
    { key: 1, title: "ID", dataIndex: "ID" },
    {
      key: 2,
      title: "Title",
      dataIndex: "title",
      editable: true,
      sorter: (a, b) => a.title.length - b.title.length,
      sortOrder: sortedInfo.columnKey === "title" && sortedInfo.order,
      ..._getColumnSearchProps("title"),
    },
    {
      key: 3,
      title: "Message",
      dataIndex: "body",
      editable: true,
      sorter: (a, b) => a.body.length - b.body.length,
      sortOrder: sortedInfo.columnKey === "body" && sortedInfo.order,
      ..._getColumnSearchProps("body"),
    },
    {
      key: 4,
      title: "Age",
      dataIndex: "age",
      align: "center",
      editable: true,
      sorter: (a, b) => a.age - b.age,
      sortOrder: sortedInfo.columnKey === "age" && sortedInfo.order,
      ..._getColumnSearchProps("age"),
    },
    {
      key: 5,
      title: "Actions",
      dataIndex: "",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <>
            {editable ? (
              <Space>
                <Button onClick={() => _onSave(record)}>Save</Button>
                <Popconfirm
                  title="Are you sue to cancel?"
                  onConfirm={_onCancel}
                >
                  <Button danger>Cancel</Button>
                </Popconfirm>
              </Space>
            ) : (
              <Space>
                <Button onClick={() => _onEdit(record)} type="primary">
                  Edit
                </Button>
                <Popconfirm
                  title="Are you sure want to delete?"
                  onConfirm={() => _handleDelete(record)}
                >
                  <Button danger type="primary">
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </>
        );
      },
    },
  ];

  // Set Editable Columns
  const _mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "age" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  // Set Editable Cell
  const _EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === "number" ? <InputNumber /> : <Input />;

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return (
    <div>
      <Title style={{ marginTop: 5, marginBottom: 5 }} level={2}>
        DataTable
      </Title>
      <Space
        style={{
          marginBottom: 16,
          marginLeft: 20,
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <Input
          placeholder="Enter Search Text"
          onChange={(e) => _handleSearchText(e)}
          type="text"
          allowClear
          value={searchText}
        />
        <Button type="primary" onClick={_handleGlobalSearch}>
          Search
        </Button>
        <Button onClick={_onReset}>Reset</Button>
        <Button
          style={{ backgroundColor: "#c2115e", color: "#fff" }}
          icon={
            <DownloadOutlined
              style={{
                marginRight: 5,
                color: "#fff",
              }}
            />
          }
        >
          <CSVLink
            style={{ color: "#fff" }}
            data={filteredData?.length > 0 ? filteredData : dataSource}
          >
            Export
          </CSVLink>
        </Button>
      </Space>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: _EditableCell,
            },
          }}
          columns={_mergedColumns}
          dataSource={dataSource}
          style={TableStyle}
          bordered
          loading={loading}
          pagination={{
            position: ["bottomCenter"],
          }}
          onChange={_handleChange}
        ></Table>
      </Form>
    </div>
  );
};

export default DataTable;
